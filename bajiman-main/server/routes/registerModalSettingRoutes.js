import express from "express";
import fs from "fs";
import path from "path";

import RegisterModalSetting from "../models/RegisterModalSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const colorFields = [
  "overlayBg",
  "modalBg",
  "headerBg",
  "headerText",
  "labelText",
  "inputBg",
  "inputText",
  "inputBorder",
  "placeholderText",
  "helperText",
  "helperIcon",
  "buttonBg",
  "buttonText",
  "buttonDisabledBg",
  "linkText",
  "footerText",
  "sliderDotActive",
  "sliderDotInactive",
  "bannerBg",
  "dropdownBg",
  "dropdownText",
  "dropdownBorder",
  "dropdownHoverBg",
];

const getOrCreateSetting = async () => {
  let setting = await RegisterModalSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await RegisterModalSetting.create({});
  }

  return setting;
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (oldPath = "") => {
  try {
    if (!oldPath) return;
    if (String(oldPath).startsWith("http")) return;

    const fullPath = path.resolve(oldPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("REGISTER MODAL FILE DELETE ERROR:", error.message);
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

const formatSetting = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    sliderImages: Array.isArray(obj.sliderImages)
      ? obj.sliderImages
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((slide) => ({
            ...slide,
            imageUrl: slide.image ? buildFileUrl(req, slide.image) : "",
          }))
      : [],
  };
};

const filesByField = (req) => {
  const map = {};
  if (!Array.isArray(req.files)) return map;

  req.files.forEach((file) => {
    map[file.fieldname] = file;
  });

  return map;
};

/* ======================================================
   GET REGISTER MODAL SETTING - ADMIN
   GET /api/register-modal-settings
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Register modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE REGISTER MODAL SETTING - PUBLIC
   GET /api/register-modal-settings/public/active
====================================================== */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await RegisterModalSetting.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Register modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE REGISTER MODAL SETTING
   PUT /api/register-modal-settings
   files:
   logo
   sliderImages.0.image
   sliderImages.1.image
====================================================== */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = clean(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    const oldLogo = setting.logo;

    if (fileMap.logo) {
      setting.logo = filePath(fileMap.logo);
    }

    if (String(req.body?.removeLogo) === "true") {
      setting.logo = "";
    }

    const incomingSlides = parseJson(
      req.body?.sliderImages,
      setting.sliderImages || [],
    );

    const sliderImages = Array.isArray(incomingSlides)
      ? incomingSlides.map((item) => ({
          _id: item?._id || undefined,
          image: clean(item?.image),
          order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
          status: item?.status === "inactive" ? "inactive" : "active",
        }))
      : [];

    sliderImages.forEach((item, index) => {
      const file = fileMap[`sliderImages.${index}.image`];

      if (file) {
        if (item.image) deleteLocalFile(item.image);
        item.image = filePath(file);
      }
    });

    const oldSlides = setting.sliderImages || [];
    const newImages = new Set(
      sliderImages.map((item) => item.image).filter(Boolean),
    );

    oldSlides.forEach((oldItem) => {
      if (oldItem?.image && !newImages.has(oldItem.image)) {
        deleteLocalFile(oldItem.image);
      }
    });

    setting.sliderImages = sliderImages;

    await setting.save();

    if (fileMap.logo && oldLogo) deleteLocalFile(oldLogo);

    if (String(req.body?.removeLogo) === "true" && oldLogo) {
      deleteLocalFile(oldLogo);
    }

    return successResponse(
      res,
      "Register modal setting updated successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE REGISTER MODAL LOGO
   DELETE /api/register-modal-settings/logo
====================================================== */
router.delete("/logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const oldLogo = setting.logo;
    setting.logo = "";

    await setting.save();

    if (oldLogo) deleteLocalFile(oldLogo);

    return successResponse(
      res,
      "Register modal logo removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE SINGLE SLIDER IMAGE
   DELETE /api/register-modal-settings/slider/:id
====================================================== */
router.delete("/slider/:id", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const slide = setting.sliderImages.id(req.params.id);

    if (!slide) {
      return errorResponse(res, "Slider image not found", 404);
    }

    const oldImage = slide.image;

    setting.sliderImages.pull(req.params.id);
    await setting.save();

    if (oldImage) deleteLocalFile(oldImage);

    return successResponse(
      res,
      "Slider image removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET REGISTER MODAL SETTING
   PATCH /api/register-modal-settings/reset
====================================================== */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    if (oldSetting.logo) deleteLocalFile(oldSetting.logo);
    oldSetting.sliderImages?.forEach((item) => deleteLocalFile(item.image));

    await RegisterModalSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await RegisterModalSetting.create({});

    return successResponse(
      res,
      "Register modal setting reset successfully",
      formatSetting(req, newSetting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
