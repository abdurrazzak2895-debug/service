import express from "express";
import fs from "fs";
import path from "path";

import AffiliateRegistrationGuideSetting from "../models/AffiliateRegistrationGuideSetting.js";
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
    console.log("AFF REG GUIDE FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateRegistrationGuideSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) setting = await AffiliateRegistrationGuideSetting.create({});
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
    cards: Array.isArray(obj.cards)
      ? obj.cards
          .filter((card) => card?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((card) => ({
            ...card,
            iconUrl: card.icon ? buildFileUrl(req, card.icon) : "",
          }))
      : [],
  };
};

/* GET /api/affiliate-registration-guide-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate registration guide setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-registration-guide-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateRegistrationGuideSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate registration guide setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-registration-guide-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    setting.sectionTitle = normalizeLocalized(
      parseJson(req.body?.sectionTitle, setting.sectionTitle),
    );

    const cards = parseJson(req.body?.cards, setting.cards || []);

    setting.cards = Array.isArray(cards)
      ? cards.map((item, index) => {
          const file = fileMap[`cards.${index}.icon`];

          const card = {
            icon: cleanText(item?.icon),
            title: normalizeLocalized(item?.title),
            description: normalizeLocalized(item?.description),
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (card.icon && !String(card.icon).startsWith("http")) {
              deleteLocalFile(card.icon);
            }

            card.icon = filePath(file);
          }

          return card;
        })
      : [];

    [
      "sectionBg",
      "titleBoxBg",
      "titleColor",
      "cardBg",
      "iconCircleBg",
      "cardTitleColor",
      "cardDescColor",
      "contentMaxWidth",
      "iconCircleSize",
    ].forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate registration guide setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-registration-guide-settings/remove-icon */
router.patch("/remove-icon", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const parentId = cleanText(req.body?.parentId);

    const item = setting.cards.id(parentId);

    if (!item) return errorResponse(res, "Card not found", 404);

    deleteLocalFile(item.icon);
    item.icon = "";

    await setting.save();

    return successResponse(
      res,
      "Guide card icon removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-registration-guide-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "transparent";
    setting.titleBoxBg = "#e8f8ff";
    setting.titleColor = "#17227a";
    setting.cardBg = "#dff8ff";
    setting.iconCircleBg = "#ffffff";
    setting.cardTitleColor = "#002d68";
    setting.cardDescColor = "#5f607e";

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
