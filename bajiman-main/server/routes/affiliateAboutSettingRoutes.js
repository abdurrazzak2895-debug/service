import express from "express";
import fs from "fs";
import path from "path";

import AffiliateAboutSetting from "../models/AffiliateAboutSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const localizedFields = ["title", "description"];

const colorFields = ["sectionBg", "cardBg", "titleColor", "descriptionColor"];

const layoutFields = ["cardMaxWidth", "logoMaxWidth"];

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
    console.log("AFF ABOUT FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateAboutSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateAboutSetting.create({});
  return setting;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
  };
};

/* GET /api/affiliate-about-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate about setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-about-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateAboutSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate about setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-about-settings */
router.put("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    localizedFields.forEach((field) => {
      setting[field] = normalizeLocalized(
        parseJson(req.body?.[field], setting[field]),
      );
    });

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

    if (req.file) {
      const oldLogo = setting.logo;
      setting.logo = filePath(req.file);
      if (oldLogo) deleteLocalFile(oldLogo);
    }

    if (String(req.body?.removeLogo) === "true") {
      deleteLocalFile(setting.logo);
      setting.logo = "";
    }

    await setting.save();

    return successResponse(
      res,
      "Affiliate about setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (req.file?.path) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-about-settings/remove-logo */
router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    deleteLocalFile(setting.logo);
    setting.logo = "";

    await setting.save();

    return successResponse(
      res,
      "Logo removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-about-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "transparent";
    setting.cardBg = "#eef6fb";
    setting.titleColor = "#161f7a";
    setting.descriptionColor = "#161f7a";

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
