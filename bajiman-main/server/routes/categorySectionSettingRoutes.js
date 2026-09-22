import express from "express";
import fs from "fs";
import path from "path";

import CategorySectionSetting from "../models/CategorySectionSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "sectionBg",
  "navBg",
  "activeItemBg",
  "inactiveItemBg",
  "itemTextColor",
  "activeBorderColor",
];

const getOrCreateSetting = async () => {
  let setting = await CategorySectionSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await CategorySectionSetting.create({});
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
    console.log("CATEGORY SECTION FILE DELETE ERROR:", error.message);
  }
};

const formatSetting = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    hotImageUrl: obj.hotImage ? buildFileUrl(req, obj.hotImage) : "",
    sportsImageUrl: obj.sportsImage
      ? buildFileUrl(req, obj.sportsImage)
      : "",
  };
};

/* ======================================================
   GET CATEGORY SECTION SETTING - ADMIN
   GET /api/category-section-settings
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Category section setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE CATEGORY SECTION SETTING - PUBLIC
   GET /api/category-section-settings/public/active
====================================================== */

router.get("/public/active", async (req, res) => {
  try {
    const setting = await CategorySectionSetting.findOne({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Category section setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE CATEGORY SECTION SETTING
   PUT /api/category-section-settings
====================================================== */

router.put(
  "/",
  protectAdmin,
  upload.fields([
    { name: "hotImage", maxCount: 1 },
    { name: "sportsImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const setting = await getOrCreateSetting();

      allowedFields.forEach((field) => {
        if (typeof req.body?.[field] !== "undefined") {
          setting[field] = clean(req.body[field]) || setting[field];
        }
      });

      setting.status = req.body?.status === "inactive" ? "inactive" : "active";

      const hotImageFile = req.files?.hotImage?.[0];
      const sportsImageFile = req.files?.sportsImage?.[0];

      const oldHotImage = setting.hotImage;
      const oldSportsImage = setting.sportsImage;

      if (hotImageFile) {
        setting.hotImage = filePath(hotImageFile);
      }

      if (sportsImageFile) {
        setting.sportsImage = filePath(sportsImageFile);
      }

      if (String(req.body?.removeHotImage) === "true") {
        setting.hotImage = "";
      }

      if (String(req.body?.removeSportsImage) === "true") {
        setting.sportsImage = "";
      }

      await setting.save();

      if (hotImageFile && oldHotImage) {
        deleteLocalFile(oldHotImage);
      }

      if (sportsImageFile && oldSportsImage) {
        deleteLocalFile(oldSportsImage);
      }

      if (String(req.body?.removeHotImage) === "true" && oldHotImage) {
        deleteLocalFile(oldHotImage);
      }

      if (String(req.body?.removeSportsImage) === "true" && oldSportsImage) {
        deleteLocalFile(oldSportsImage);
      }

      return successResponse(
        res,
        "Category section setting updated successfully",
        formatSetting(req, setting),
      );
    } catch (error) {
      const hotImageFile = req.files?.hotImage?.[0];
      const sportsImageFile = req.files?.sportsImage?.[0];

      if (hotImageFile) deleteLocalFile(hotImageFile.path);
      if (sportsImageFile) deleteLocalFile(sportsImageFile.path);

      return errorResponse(res, error.message || "Server error", 500);
    }
  },
);

/* ======================================================
   REMOVE HOT IMAGE
   DELETE /api/category-section-settings/hot-image
====================================================== */

router.delete("/hot-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const oldHotImage = setting.hotImage;

    setting.hotImage = "";
    await setting.save();

    if (oldHotImage) {
      deleteLocalFile(oldHotImage);
    }

    return successResponse(
      res,
      "Hot image removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE SPORTS IMAGE
   DELETE /api/category-section-settings/sports-image
====================================================== */

router.delete("/sports-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const oldSportsImage = setting.sportsImage;

    setting.sportsImage = "";
    await setting.save();

    if (oldSportsImage) {
      deleteLocalFile(oldSportsImage);
    }

    return successResponse(
      res,
      "Sports image removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET CATEGORY SECTION SETTING
   PATCH /api/category-section-settings/reset
====================================================== */

router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    const oldHotImage = oldSetting.hotImage;
    const oldSportsImage = oldSetting.sportsImage;

    await CategorySectionSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await CategorySectionSetting.create({});

    if (oldHotImage) deleteLocalFile(oldHotImage);
    if (oldSportsImage) deleteLocalFile(oldSportsImage);

    return successResponse(
      res,
      "Category section setting reset successfully",
      formatSetting(req, newSetting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;