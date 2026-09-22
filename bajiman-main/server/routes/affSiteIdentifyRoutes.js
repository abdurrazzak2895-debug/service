import express from "express";
import fs from "fs";
import path from "path";

import AffSiteIdentify from "../models/AffSiteIdentify.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

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

const deleteLocalFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (String(filePath).startsWith("http")) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FILE DELETE ERROR:", error.message);
  }
};

const uploadFields = upload.fields([
  { name: "logoImage", maxCount: 1 },
  { name: "faviconImage", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 },
]);

export const formatAffSiteIdentify = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoImageUrl: obj.logoImage ? buildFileUrl(req, obj.logoImage) : "",
    faviconImageUrl: obj.faviconImage
      ? buildFileUrl(req, obj.faviconImage)
      : "",
    backgroundImageUrl: obj.backgroundImage
      ? buildFileUrl(req, obj.backgroundImage)
      : "",
  };
};

/* ======================================================
   CREATE OR UPDATE SINGLE AFFILIATE SITE IDENTIFY
   POST /api/aff-site-identify
====================================================== */
router.post("/", protectAdmin, uploadFields, async (req, res) => {
  try {
    const siteNameBn = cleanText(req.body?.siteNameBn);
    const siteNameEn = cleanText(req.body?.siteNameEn);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    const logoFile = req.files?.logoImage?.[0];
    const faviconFile = req.files?.faviconImage?.[0];
    const backgroundFile = req.files?.backgroundImage?.[0];

    if (!siteNameBn || !siteNameEn) {
      if (logoFile) deleteLocalFile(logoFile.path);
      if (faviconFile) deleteLocalFile(faviconFile.path);
      if (backgroundFile) deleteLocalFile(backgroundFile.path);

      return errorResponse(
        res,
        "Affiliate site name Bangla and English are required",
        400,
      );
    }

    const existing = await AffSiteIdentify.findOne();
    let affSiteIdentify;

    if (existing) {
      const oldLogo = existing.logoImage;
      const oldFavicon = existing.faviconImage;
      const oldBackground = existing.backgroundImage;

      existing.siteName = {
        bn: siteNameBn,
        en: siteNameEn,
      };

      existing.status = status;

      if (logoFile) {
        existing.logoImage = filePath(logoFile);
      }

      if (faviconFile) {
        existing.faviconImage = filePath(faviconFile);
      }

      if (backgroundFile) {
        existing.backgroundImage = filePath(backgroundFile);
      }

      await existing.save();

      if (logoFile && oldLogo && !String(oldLogo).startsWith("http")) {
        deleteLocalFile(oldLogo);
      }

      if (faviconFile && oldFavicon && !String(oldFavicon).startsWith("http")) {
        deleteLocalFile(oldFavicon);
      }

      if (
        backgroundFile &&
        oldBackground &&
        !String(oldBackground).startsWith("http")
      ) {
        deleteLocalFile(oldBackground);
      }

      affSiteIdentify = existing;
    } else {
      affSiteIdentify = await AffSiteIdentify.create({
        siteName: {
          bn: siteNameBn,
          en: siteNameEn,
        },
        logoImage: logoFile ? filePath(logoFile) : "",
        faviconImage: faviconFile ? filePath(faviconFile) : "",
        backgroundImage: backgroundFile ? filePath(backgroundFile) : "",
        status,
      });
    }

    return successResponse(
      res,
      "Affiliate site identify saved successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    const logoFile = req.files?.logoImage?.[0];
    const faviconFile = req.files?.faviconImage?.[0];
    const backgroundFile = req.files?.backgroundImage?.[0];

    if (logoFile) deleteLocalFile(logoFile.path);
    if (faviconFile) deleteLocalFile(faviconFile.path);
    if (backgroundFile) deleteLocalFile(backgroundFile.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET AFFILIATE SITE IDENTIFY - ADMIN
   GET /api/aff-site-identify
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOne().sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate site identify fetched successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE AFFILIATE SITE IDENTIFY - PUBLIC
   GET /api/aff-site-identify/active
====================================================== */
router.get("/active", async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Active affiliate site identify fetched successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE LOGO
====================================================== */
router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOne();

    if (!affSiteIdentify) {
      return errorResponse(res, "Affiliate site identify not found", 404);
    }

    const oldLogo = affSiteIdentify.logoImage;
    affSiteIdentify.logoImage = "";

    await affSiteIdentify.save();

    if (oldLogo && !String(oldLogo).startsWith("http")) {
      deleteLocalFile(oldLogo);
    }

    return successResponse(
      res,
      "Affiliate logo removed successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE FAVICON
====================================================== */
router.patch("/remove-favicon", protectAdmin, async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOne();

    if (!affSiteIdentify) {
      return errorResponse(res, "Affiliate site identify not found", 404);
    }

    const oldFavicon = affSiteIdentify.faviconImage;
    affSiteIdentify.faviconImage = "";

    await affSiteIdentify.save();

    if (oldFavicon && !String(oldFavicon).startsWith("http")) {
      deleteLocalFile(oldFavicon);
    }

    return successResponse(
      res,
      "Affiliate favicon removed successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE BACKGROUND
====================================================== */
router.patch("/remove-background", protectAdmin, async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOne();

    if (!affSiteIdentify) {
      return errorResponse(res, "Affiliate site identify not found", 404);
    }

    const oldBackground = affSiteIdentify.backgroundImage;
    affSiteIdentify.backgroundImage = "";

    await affSiteIdentify.save();

    if (oldBackground && !String(oldBackground).startsWith("http")) {
      deleteLocalFile(oldBackground);
    }

    return successResponse(
      res,
      "Affiliate background image removed successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE AFFILIATE SITE IDENTIFY
====================================================== */
router.delete("/", protectAdmin, async (req, res) => {
  try {
    const affSiteIdentify = await AffSiteIdentify.findOneAndDelete();

    if (!affSiteIdentify) {
      return errorResponse(res, "Affiliate site identify not found", 404);
    }

    if (
      affSiteIdentify.logoImage &&
      !String(affSiteIdentify.logoImage).startsWith("http")
    ) {
      deleteLocalFile(affSiteIdentify.logoImage);
    }

    if (
      affSiteIdentify.faviconImage &&
      !String(affSiteIdentify.faviconImage).startsWith("http")
    ) {
      deleteLocalFile(affSiteIdentify.faviconImage);
    }

    if (
      affSiteIdentify.backgroundImage &&
      !String(affSiteIdentify.backgroundImage).startsWith("http")
    ) {
      deleteLocalFile(affSiteIdentify.backgroundImage);
    }

    return successResponse(
      res,
      "Affiliate site identify deleted successfully",
      formatAffSiteIdentify(req, affSiteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
