import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import Promotion from "../models/Promotion.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const PROMOTION_CATEGORIES = [
  "Welcome Offer",
  "Slots",
  "Live Casino",
  "Sports",
  "Fishing",
  "Lottery",
  "Table",
  "Arcade",
  "Crash",
];

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

const formatPromotion = (req, item) => {
  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    imageUrl: obj.image ? buildFileUrl(req, obj.image) : "",
  };
};

/* ======================================================
   PROMOTION CATEGORIES
   GET /api/promotions/categories/list
====================================================== */

router.get("/categories/list", protectAdmin, async (req, res) => {
  return successResponse(
    res,
    "Promotion categories fetched successfully",
    PROMOTION_CATEGORIES
  );
});

/* ======================================================
   CREATE PROMOTION
   POST /api/promotions
====================================================== */

router.post("/", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const {
      category,
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      order,
      status,
    } = req.body || {};

    if (!PROMOTION_CATEGORIES.includes(category)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Valid promotion category is required", 400);
    }

    if (!cleanText(titleBn) || !cleanText(titleEn)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Promotion title BN and EN are required", 400);
    }

    if (!cleanText(descriptionBn) || !cleanText(descriptionEn)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(
        res,
        "Promotion description BN and EN are required",
        400
      );
    }

    const promotion = await Promotion.create({
      category,
      title: {
        bn: cleanText(titleBn),
        en: cleanText(titleEn),
      },
      description: {
        bn: cleanText(descriptionBn),
        en: cleanText(descriptionEn),
      },
      image: req.file ? filePath(req.file) : "",
      order: Number(order) || 0,
      status: status === "inactive" ? "inactive" : "active",
    });

    return successResponse(
      res,
      "Promotion created successfully",
      formatPromotion(req, promotion),
      201
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL PROMOTIONS - ADMIN
   GET /api/promotions
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
      page = 1,
      limit = 50,
    } = req.query || {};

    const query = {};

    if (category) {
      if (!PROMOTION_CATEGORIES.includes(category)) {
        return errorResponse(res, "Invalid promotion category", 400);
      }

      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "title.bn": { $regex: search, $options: "i" } },
        { "title.en": { $regex: search, $options: "i" } },
        { "description.bn": { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Promotion.countDocuments(query),
    ]);

    return successResponse(res, "Promotions fetched successfully", {
      promotions: promotions.map((item) => formatPromotion(req, item)),
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
   GET ACTIVE PROMOTIONS - PUBLIC
   GET /api/promotions/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const { category = "" } = req.query || {};

    const query = { status: "active" };

    if (category && PROMOTION_CATEGORIES.includes(category)) {
      query.category = category;
    }

    const promotions = await Promotion.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active promotions fetched successfully",
      promotions.map((item) => formatPromotion(req, item))
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE PROMOTION
   GET /api/promotions/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid promotion id", 400);
    }

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion not found", 404);
    }

    return successResponse(
      res,
      "Promotion fetched successfully",
      formatPromotion(req, promotion)
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE PROMOTION
   PUT /api/promotions/:id
====================================================== */

router.put("/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Invalid promotion id", 400);
    }

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Promotion not found", 404);
    }

    const {
      category,
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      order,
      status,
      removeOldImage,
    } = req.body || {};

    if (!PROMOTION_CATEGORIES.includes(category)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Valid promotion category is required", 400);
    }

    if (!cleanText(titleBn) || !cleanText(titleEn)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Promotion title BN and EN are required", 400);
    }

    if (!cleanText(descriptionBn) || !cleanText(descriptionEn)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(
        res,
        "Promotion description BN and EN are required",
        400
      );
    }

    const oldImage = promotion.image;

    promotion.category = category;
    promotion.title = {
      bn: cleanText(titleBn),
      en: cleanText(titleEn),
    };
    promotion.description = {
      bn: cleanText(descriptionBn),
      en: cleanText(descriptionEn),
    };
    promotion.order = Number(order) || 0;
    promotion.status = status === "inactive" ? "inactive" : "active";

    if (req.file) {
      promotion.image = filePath(req.file);
    } else if (removeOldImage === "true") {
      promotion.image = "";
    }

    await promotion.save();

    if (req.file && oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    if (removeOldImage === "true" && !req.file && oldImage) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Promotion updated successfully",
      formatPromotion(req, promotion)
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE PROMOTION IMAGE
   PATCH /api/promotions/:id/remove-image
====================================================== */

router.patch("/:id/remove-image", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid promotion id", 400);
    }

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion not found", 404);
    }

    const oldImage = promotion.image;

    promotion.image = "";

    await promotion.save();

    if (oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Promotion image removed successfully",
      formatPromotion(req, promotion)
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE PROMOTION
   DELETE /api/promotions/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid promotion id", 400);
    }

    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion not found", 404);
    }

    if (promotion.image && !String(promotion.image).startsWith("http")) {
      deleteLocalFile(promotion.image);
    }

    return successResponse(
      res,
      "Promotion deleted successfully",
      formatPromotion(req, promotion)
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;