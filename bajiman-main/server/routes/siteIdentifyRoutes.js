import express from "express";
import fs from "fs";
import path from "path";

import SiteIdentify from "../models/SiteIdentify.js";

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

  const normalized = filePath.replace(/\\/g, "/");
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
]);

const formatSiteIdentify = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoImageUrl: obj.logoImage ? buildFileUrl(req, obj.logoImage) : "",
    faviconImageUrl: obj.faviconImage
      ? buildFileUrl(req, obj.faviconImage)
      : "",
  };
};

/* ======================================================
   CREATE OR UPDATE SINGLE SITE IDENTIFY
   POST /api/site-identify
====================================================== */

router.post("/", protectAdmin, uploadFields, async (req, res) => {
  try {
    const siteNameBn = cleanText(req.body?.siteNameBn);
    const siteNameEn = cleanText(req.body?.siteNameEn);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    const logoFile = req.files?.logoImage?.[0];
    const faviconFile = req.files?.faviconImage?.[0];

    if (!siteNameBn || !siteNameEn) {
      if (logoFile) deleteLocalFile(logoFile.path);
      if (faviconFile) deleteLocalFile(faviconFile.path);

      return errorResponse(
        res,
        "Site name Bangla and English are required",
        400,
      );
    }

    const existing = await SiteIdentify.findOne();

    let siteIdentify;

    if (existing) {
      const oldLogo = existing.logoImage;
      const oldFavicon = existing.faviconImage;

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

      await existing.save();

      if (logoFile && oldLogo && !String(oldLogo).startsWith("http")) {
        deleteLocalFile(oldLogo);
      }

      if (faviconFile && oldFavicon && !String(oldFavicon).startsWith("http")) {
        deleteLocalFile(oldFavicon);
      }

      siteIdentify = existing;
    } else {
      siteIdentify = await SiteIdentify.create({
        siteName: {
          bn: siteNameBn,
          en: siteNameEn,
        },
        logoImage: logoFile ? filePath(logoFile) : "",
        faviconImage: faviconFile ? filePath(faviconFile) : "",
        status,
      });
    }

    return successResponse(
      res,
      "Site identify saved successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    const logoFile = req.files?.logoImage?.[0];
    const faviconFile = req.files?.faviconImage?.[0];

    if (logoFile) deleteLocalFile(logoFile.path);
    if (faviconFile) deleteLocalFile(faviconFile.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SITE IDENTIFY - ADMIN
   GET /api/site-identify
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const siteIdentify = await SiteIdentify.findOne().sort({ createdAt: -1 });

    return successResponse(
      res,
      "Site identify fetched successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE SITE IDENTIFY - PUBLIC
   GET /api/site-identify/active
====================================================== */

router.get("/active", async (req, res) => {
  try {
    const siteIdentify = await SiteIdentify.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active site identify fetched successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE LOGO
   PATCH /api/site-identify/remove-logo
====================================================== */

router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const siteIdentify = await SiteIdentify.findOne();

    if (!siteIdentify) {
      return errorResponse(res, "Site identify not found", 404);
    }

    const oldLogo = siteIdentify.logoImage;
    siteIdentify.logoImage = "";

    await siteIdentify.save();

    if (oldLogo && !String(oldLogo).startsWith("http")) {
      deleteLocalFile(oldLogo);
    }

    return successResponse(
      res,
      "Logo removed successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE FAVICON
   PATCH /api/site-identify/remove-favicon
====================================================== */

router.patch("/remove-favicon", protectAdmin, async (req, res) => {
  try {
    const siteIdentify = await SiteIdentify.findOne();

    if (!siteIdentify) {
      return errorResponse(res, "Site identify not found", 404);
    }

    const oldFavicon = siteIdentify.faviconImage;
    siteIdentify.faviconImage = "";

    await siteIdentify.save();

    if (oldFavicon && !String(oldFavicon).startsWith("http")) {
      deleteLocalFile(oldFavicon);
    }

    return successResponse(
      res,
      "Favicon removed successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE SITE IDENTIFY
   DELETE /api/site-identify
====================================================== */

router.delete("/", protectAdmin, async (req, res) => {
  try {
    const siteIdentify = await SiteIdentify.findOneAndDelete();

    if (!siteIdentify) {
      return errorResponse(res, "Site identify not found", 404);
    }

    if (
      siteIdentify.logoImage &&
      !String(siteIdentify.logoImage).startsWith("http")
    ) {
      deleteLocalFile(siteIdentify.logoImage);
    }

    if (
      siteIdentify.faviconImage &&
      !String(siteIdentify.faviconImage).startsWith("http")
    ) {
      deleteLocalFile(siteIdentify.faviconImage);
    }

    return successResponse(
      res,
      "Site identify deleted successfully",
      formatSiteIdentify(req, siteIdentify),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
