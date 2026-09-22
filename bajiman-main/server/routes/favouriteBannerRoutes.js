import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import FavouriteBanner from "../models/FavouriteBanner.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const formatBanner = (req, item) => {
  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    imageUrl: obj.image ? buildFileUrl(req, obj.image) : "",
  };
};

/* ======================================================
   CREATE FAVOURITE BANNER
   POST /api/favourite-banners
====================================================== */

router.post("/", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const link = cleanText(req.body?.link);
    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!req.file) {
      return errorResponse(res, "Favourite banner image is required", 400);
    }

    const banner = await FavouriteBanner.create({
      image: filePath(req.file),
      link,
      order: Number.isFinite(order) ? order : 0,
      status,
    });

    return successResponse(
      res,
      "Favourite banner created successfully",
      formatBanner(req, banner),
      201,
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL FAVOURITE BANNERS - ADMIN
   GET /api/favourite-banners
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 50 } = req.query || {};

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.link = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [banners, total] = await Promise.all([
      FavouriteBanner.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      FavouriteBanner.countDocuments(query),
    ]);

    return successResponse(res, "Favourite banners fetched successfully", {
      banners: banners.map((item) => formatBanner(req, item)),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE FAVOURITE BANNERS - PUBLIC
   GET /api/favourite-banners/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const banners = await FavouriteBanner.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active favourite banners fetched successfully",
      banners.map((item) => formatBanner(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE FAVOURITE BANNER
   GET /api/favourite-banners/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid favourite banner id", 400);
    }

    const banner = await FavouriteBanner.findById(req.params.id);

    if (!banner) {
      return errorResponse(res, "Favourite banner not found", 404);
    }

    return successResponse(
      res,
      "Favourite banner fetched successfully",
      formatBanner(req, banner),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE FAVOURITE BANNER
   PUT /api/favourite-banners/:id
====================================================== */

router.put("/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Invalid favourite banner id", 400);
    }

    const banner = await FavouriteBanner.findById(req.params.id);

    if (!banner) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Favourite banner not found", 404);
    }

    const oldImage = banner.image;

    const link = cleanText(req.body?.link);
    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";
    const removeOldImage = String(req.body?.removeOldImage) === "true";

    banner.link = link;
    banner.order = Number.isFinite(order) ? order : 0;
    banner.status = status;

    if (req.file) {
      banner.image = filePath(req.file);
    } else if (removeOldImage) {
      banner.image = "";
    }

    await banner.save();

    if (req.file && oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    if (removeOldImage && !req.file && oldImage) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Favourite banner updated successfully",
      formatBanner(req, banner),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE FAVOURITE BANNER IMAGE
   PATCH /api/favourite-banners/:id/remove-image
====================================================== */

router.patch("/:id/remove-image", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid favourite banner id", 400);
    }

    const banner = await FavouriteBanner.findById(req.params.id);

    if (!banner) {
      return errorResponse(res, "Favourite banner not found", 404);
    }

    const oldImage = banner.image;
    banner.image = "";

    await banner.save();

    if (oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Favourite banner image removed successfully",
      formatBanner(req, banner),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE FAVOURITE BANNER
   DELETE /api/favourite-banners/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid favourite banner id", 400);
    }

    const banner = await FavouriteBanner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return errorResponse(res, "Favourite banner not found", 404);
    }

    if (banner.image && !String(banner.image).startsWith("http")) {
      deleteLocalFile(banner.image);
    }

    return successResponse(
      res,
      "Favourite banner deleted successfully",
      formatBanner(req, banner),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
