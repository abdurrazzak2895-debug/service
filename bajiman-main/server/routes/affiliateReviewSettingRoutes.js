import express from "express";
import fs from "fs";
import path from "path";

import AffiliateReviewSetting from "../models/AffiliateReviewSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const parseJson = (value, fallback) => {
  try {
    if (typeof value === "undefined") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeLocalized = (value = {}) => ({
  bn: cleanText(value?.bn),
  en: cleanText(value?.en),
});

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, value = "") => {
  if (!value) return "";
  if (String(value).startsWith("http")) return value;

  const normalized = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (oldPath = "") => {
  try {
    if (!oldPath) return;
    if (String(oldPath).startsWith("http")) return;

    const fullPath = path.resolve(oldPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.log("AFF REVIEW FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateReviewSetting.findOne().sort({ createdAt: -1 });

  if (!setting) setting = await AffiliateReviewSetting.create({});
  return setting;
};

const filesByField = (req) => {
  const map = {};
  if (!Array.isArray(req.files)) return map;

  req.files.forEach((file) => {
    map[file.fieldname] = file;
  });

  return map;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    reviews: Array.isArray(obj.reviews)
      ? obj.reviews
          .filter((review) => review?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((review) => ({
            ...review,
            logoUrl: review.logo ? buildFileUrl(req, review.logo) : "",
          }))
      : [],
  };
};

/* GET /api/affiliate-review-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate review setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-review-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateReviewSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate review setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-review-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    setting.sectionTitle = normalizeLocalized(
      parseJson(req.body?.sectionTitle, setting.sectionTitle),
    );

    const reviews = parseJson(req.body?.reviews, setting.reviews || []);

    setting.reviews = Array.isArray(reviews)
      ? reviews.map((item, index) => {
          const file = fileMap[`reviews.${index}.logo`];

          const review = {
            logo: cleanText(item?.logo),
            reviewText: normalizeLocalized(item?.reviewText),
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (review.logo && !String(review.logo).startsWith("http")) {
              deleteLocalFile(review.logo);
            }

            review.logo = filePath(file);
          }

          return review;
        })
      : [];

    [
      "sectionBg",
      "cardGradientFrom",
      "cardGradientVia",
      "cardGradientTo",
      "titleColor",
      "reviewCardBg",
      "reviewTextColor",
      "navBorderColor",
      "navTextColor",
      "navHoverBg",
      "navHoverTextColor",
      "contentMaxWidth",
    ].forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    if (typeof req.body?.autoplayDelay !== "undefined") {
      setting.autoplayDelay = Number.isFinite(Number(req.body.autoplayDelay))
        ? Number(req.body.autoplayDelay)
        : setting.autoplayDelay;
    }

    if (typeof req.body?.slideSpeed !== "undefined") {
      setting.slideSpeed = Number.isFinite(Number(req.body.slideSpeed))
        ? Number(req.body.slideSpeed)
        : setting.slideSpeed;
    }

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate review setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-review-settings/remove-logo */
router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const parentId = cleanText(req.body?.parentId);

    const item = setting.reviews.id(parentId);

    if (!item) return errorResponse(res, "Review not found", 404);

    deleteLocalFile(item.logo);
    item.logo = "";

    await setting.save();

    return successResponse(
      res,
      "Review logo removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-review-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "transparent";
    setting.cardGradientFrom = "#3d80c8";
    setting.cardGradientVia = "#479e95";
    setting.cardGradientTo = "#50cf31";
    setting.titleColor = "#ffffff";
    setting.reviewCardBg = "#ffffff";
    setting.reviewTextColor = "#02066e";
    setting.navBorderColor = "#ffffff";
    setting.navTextColor = "#ffffff";
    setting.navHoverBg = "#ffffff";
    setting.navHoverTextColor = "#236cb5";

    await setting.save();

    return successResponse(
      res,
      "Colors reset successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
