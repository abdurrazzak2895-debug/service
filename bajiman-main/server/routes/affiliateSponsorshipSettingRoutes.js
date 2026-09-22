import express from "express";
import fs from "fs";
import path from "path";

import AffiliateSponsorshipSetting from "../models/AffiliateSponsorshipSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const colorFields = ["sectionBg", "titleColor"];
const layoutFields = [
  "sectionPaddingY",
  "contentMaxWidth",
  "sponsorImageHeight",
];

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
    console.log("AFF SPONSORSHIP FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateSponsorshipSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) setting = await AffiliateSponsorshipSetting.create({});
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
    sponsors: Array.isArray(obj.sponsors)
      ? obj.sponsors
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],
  };
};

/* GET /api/affiliate-sponsorship-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate sponsorship setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-sponsorship-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateSponsorshipSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate sponsorship setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-sponsorship-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    setting.title = normalizeLocalized(
      parseJson(req.body?.title, setting.title),
    );

    const sponsors = parseJson(req.body?.sponsors, setting.sponsors || []);

    setting.sponsors = Array.isArray(sponsors)
      ? sponsors.map((item, index) => {
          const file = fileMap[`sponsors.${index}.image`];

          const sponsor = {
            name: cleanText(item?.name),
            image: cleanText(item?.image),
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (sponsor.image && !String(sponsor.image).startsWith("http")) {
              deleteLocalFile(sponsor.image);
            }

            sponsor.image = filePath(file);
          }

          return sponsor;
        })
      : [];

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    layoutFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate sponsorship setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-sponsorship-settings/remove-image */
router.patch("/remove-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const parentId = cleanText(req.body?.parentId);

    const item = setting.sponsors.id(parentId);

    if (!item) return errorResponse(res, "Sponsor not found", 404);

    deleteLocalFile(item.image);
    item.image = "";

    await setting.save();

    return successResponse(
      res,
      "Sponsor image removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-sponsorship-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "#226f2d";
    setting.titleColor = "#ffffff";

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
