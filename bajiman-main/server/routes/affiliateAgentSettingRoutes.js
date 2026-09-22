import express from "express";
import fs from "fs";
import path from "path";

import AffiliateAgentSetting from "../models/AffiliateAgentSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const localizedFields = ["topText", "title", "line1", "line2", "buttonText"];

const colorFields = [
  "topBg",
  "topTextColor",
  "titleColor",
  "lineColor",
  "buttonBg",
  "buttonTextColor",
  "buttonIconBg",
  "buttonIconColor",
];

const layoutFields = ["sectionMinHeight", "contentMaxWidth"];

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
    console.log("AFF AGENT FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateAgentSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateAgentSetting.create({});
  return setting;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    backgroundImageUrl: obj.backgroundImage
      ? buildFileUrl(req, obj.backgroundImage)
      : "",
    rightImageUrl: obj.rightImage ? buildFileUrl(req, obj.rightImage) : "",
  };
};

/* GET /api/affiliate-agent-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    return successResponse(
      res,
      "Affiliate agent setting fetched",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-agent-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateAgentSetting.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate agent setting fetched",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-agent-settings */
router.put(
  "/",
  protectAdmin,
  upload.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "rightImage", maxCount: 1 },
  ]),
  async (req, res) => {
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

      setting.buttonLink = cleanText(req.body?.buttonLink);
      setting.status = req.body?.status === "inactive" ? "inactive" : "active";

      const bgFile = req.files?.backgroundImage?.[0];
      const rightFile = req.files?.rightImage?.[0];

      if (bgFile) {
        const old = setting.backgroundImage;
        setting.backgroundImage = filePath(bgFile);
        if (old) deleteLocalFile(old);
      }

      if (rightFile) {
        const old = setting.rightImage;
        setting.rightImage = filePath(rightFile);
        if (old) deleteLocalFile(old);
      }

      if (String(req.body?.removeBackgroundImage) === "true") {
        deleteLocalFile(setting.backgroundImage);
        setting.backgroundImage = "";
      }

      if (String(req.body?.removeRightImage) === "true") {
        deleteLocalFile(setting.rightImage);
        setting.rightImage = "";
      }

      await setting.save();

      return successResponse(
        res,
        "Affiliate agent setting updated successfully",
        addUrls(req, setting),
      );
    } catch (error) {
      Object.values(req.files || {})
        .flat()
        .forEach((file) => deleteLocalFile(file.path));

      return errorResponse(res, error.message || "Server error", 500);
    }
  },
);

/* PATCH /api/affiliate-agent-settings/remove-image */
router.patch("/remove-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const type = cleanText(req.body?.type);

    if (type === "backgroundImage") {
      deleteLocalFile(setting.backgroundImage);
      setting.backgroundImage = "";
    } else if (type === "rightImage") {
      deleteLocalFile(setting.rightImage);
      setting.rightImage = "";
    } else {
      return errorResponse(res, "Invalid image type", 400);
    }

    await setting.save();

    return successResponse(
      res,
      "Image removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-agent-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.topBg = "#ffffff";
    setting.topTextColor = "#0067bd";
    setting.titleColor = "#32e414";
    setting.lineColor = "#ffffff";
    setting.buttonBg = "#42ea08";
    setting.buttonTextColor = "#0067bd";
    setting.buttonIconBg = "#d2cc27";
    setting.buttonIconColor = "#ffffff";

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
