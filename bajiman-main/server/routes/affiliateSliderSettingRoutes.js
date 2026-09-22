import express from "express";
import fs from "fs";
import path from "path";

import AffiliateSliderSetting from "../models/AffiliateSliderSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

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
    console.log("AFF SLIDER FILE DELETE ERROR:", error.message);
  }
};

const parseJson = (value, fallback) => {
  try {
    if (typeof value === "undefined") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateSliderSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateSliderSetting.create({});
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

const formatSetting = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    bgImageUrl: obj.bgImage ? buildFileUrl(req, obj.bgImage) : "",
    slides: Array.isArray(obj.slides)
      ? obj.slides
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],
  };
};

/* GET /api/affiliate-slider-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate slider setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-slider-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateSliderSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate slider setting fetched successfully",
      setting ? formatSetting(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-slider-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    const oldBgImage = setting.bgImage;

    const slides = parseJson(req.body?.slides, setting.slides || []);

    const cleanSlides = Array.isArray(slides)
      ? slides.map((item, index) => {
          const file = fileMap[`slides.${index}.image`];

          const slide = {
            image: cleanText(item?.image),
            link: cleanText(item?.link),
            alt: cleanText(item?.alt),
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (slide.image && !String(slide.image).startsWith("http")) {
              deleteLocalFile(slide.image);
            }

            slide.image = filePath(file);
          }

          return slide;
        })
      : [];

    setting.slides = cleanSlides;

    setting.autoPlay = String(req.body?.autoPlay) === "false" ? false : true;
    setting.interval = Number.isFinite(Number(req.body?.interval))
      ? Number(req.body.interval)
      : 4500;

    setting.sectionPaddingY = cleanText(req.body?.sectionPaddingY) || "16px";
    setting.sectionPaddingYDesktop =
      cleanText(req.body?.sectionPaddingYDesktop) || "40px";

    setting.dotActiveBg = cleanText(req.body?.dotActiveBg) || "#087cff";
    setting.dotInactiveBg = cleanText(req.body?.dotInactiveBg) || "#151515";
    setting.dotHoverBg = cleanText(req.body?.dotHoverBg) || "#087cff";

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    if (fileMap.bgImage) {
      setting.bgImage = filePath(fileMap.bgImage);

      if (oldBgImage && !String(oldBgImage).startsWith("http")) {
        deleteLocalFile(oldBgImage);
      }
    }

    if (String(req.body?.removeBgImage) === "true") {
      deleteLocalFile(setting.bgImage);
      setting.bgImage = "";
    }

    await setting.save();

    return successResponse(
      res,
      "Affiliate slider setting updated successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-slider-settings/remove-image */
router.patch("/remove-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const type = cleanText(req.body?.type);
    const parentId = cleanText(req.body?.parentId);

    if (type === "bgImage") {
      deleteLocalFile(setting.bgImage);
      setting.bgImage = "";
    } else if (type === "slide") {
      const item = setting.slides.id(parentId);

      if (!item) return errorResponse(res, "Slide not found", 404);

      deleteLocalFile(item.image);
      item.image = "";
    } else {
      return errorResponse(res, "Invalid image type", 400);
    }

    await setting.save();

    return successResponse(
      res,
      "Image removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-slider-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.dotActiveBg = "#087cff";
    setting.dotInactiveBg = "#151515";
    setting.dotHoverBg = "#087cff";

    await setting.save();

    return successResponse(
      res,
      "Slider colors reset successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
