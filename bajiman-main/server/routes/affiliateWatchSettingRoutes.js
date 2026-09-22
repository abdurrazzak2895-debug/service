import express from "express";

import AffiliateWatchSetting from "../models/AffiliateWatchSetting.js";
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

const extractYoutubeId = (value = "") => {
  const text = cleanText(value);
  if (!text) return "";

  if (/^[a-zA-Z0-9_-]{6,}$/.test(text) && !text.includes("/")) {
    return text;
  }

  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateWatchSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateWatchSetting.create({});
  return setting;
};

const addEmbedUrl = (doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};
  const id = obj.videoId || extractYoutubeId(obj.videoUrl);

  return {
    ...obj,
    embedUrl: id ? `https://www.youtube.com/embed/${id}` : "",
  };
};

/* GET /api/affiliate-watch-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate watch setting fetched successfully",
      addEmbedUrl(setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-watch-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateWatchSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate watch setting fetched successfully",
      setting ? addEmbedUrl(setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-watch-settings */
router.put("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionTitle = normalizeLocalized(
      parseJson(req.body?.sectionTitle, setting.sectionTitle),
    );

    const incomingVideoUrl = cleanText(req.body?.videoUrl);
    const incomingVideoId = cleanText(req.body?.videoId);
    const extractedId =
      extractYoutubeId(incomingVideoUrl) || extractYoutubeId(incomingVideoId);

    if (typeof req.body?.videoUrl !== "undefined") {
      setting.videoUrl = incomingVideoUrl;
    }

    if (extractedId) {
      setting.videoId = extractedId;
    } else if (incomingVideoId) {
      setting.videoId = incomingVideoId;
    }

    [
      "sectionBg",
      "cardBg",
      "titleColor",
      "videoBorderColor",
      "videoBg",
      "contentMaxWidth",
      "videoMaxWidth",
    ].forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate watch setting updated successfully",
      addEmbedUrl(setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-watch-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "transparent";
    setting.cardBg = "#ffffff";
    setting.titleColor = "#17227a";
    setting.videoBorderColor = "#333333";
    setting.videoBg = "#000000";

    await setting.save();

    return successResponse(
      res,
      "Colors reset successfully",
      addEmbedUrl(setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
