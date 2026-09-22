import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import Sport from "../models/Sport.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const toBool = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

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

const formatSport = (req, sport) => {
  const obj = sport.toObject ? sport.toObject() : sport;

  return {
    ...obj,
    iconImageUrl: obj.iconImage ? buildFileUrl(req, obj.iconImage) : "",
  };
};

/* ======================================================
   CREATE SPORT
   POST /api/sports
====================================================== */

router.post("/", protectAdmin, upload.single("iconImage"), async (req, res) => {
  try {
    const nameBn = cleanText(req.body?.name_bn);
    const nameEn = cleanText(req.body?.name_en);
    const gameId = cleanText(req.body?.gameId);
    const order = Number(req.body?.order || 0);

    if (!nameBn || !nameEn || !gameId) {
      if (req.file) deleteLocalFile(req.file.path);

      return errorResponse(
        res,
        "Bangla name, English name and gameId are required",
        400,
      );
    }

    const sport = await Sport.create({
      name: {
        bn: nameBn,
        en: nameEn,
      },
      iconImage: req.file ? filePath(req.file) : "",
      gameId,
      isActive:
        req.body?.isActive === undefined ? true : toBool(req.body?.isActive),
      order: Number.isFinite(order) ? order : 0,
      syncStatus: "pending",
    });

    return successResponse(
      res,
      "Sport created successfully",
      formatSport(req, sport),
      201,
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL SPORTS
   GET /api/sports
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const {
      search = "",
      isActive = "",
      syncStatus = "",
      page = 1,
      limit = 50,
    } = req.query || {};

    const query = {};

    if (isActive !== "") {
      query.isActive = toBool(isActive);
    }

    if (syncStatus) {
      query.syncStatus = syncStatus;
    }

    if (search) {
      query.$or = [
        {
          "name.bn": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "name.en": {
            $regex: search,
            $options: "i",
          },
        },
        {
          gameId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [sports, total] = await Promise.all([
      Sport.find(query)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNum),

      Sport.countDocuments(query),
    ]);

    return successResponse(res, "Sports fetched successfully", {
      sports: sports.map((item) => formatSport(req, item)),
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
   GET ACTIVE SPORTS PUBLIC
   GET /api/sports/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const sports = await Sport.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active sports fetched successfully",
      sports.map((item) => formatSport(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE SPORT
   GET /api/sports/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid sport id", 400);
    }

    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return errorResponse(res, "Sport not found", 404);
    }

    return successResponse(
      res,
      "Sport fetched successfully",
      formatSport(req, sport),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE SPORT
   PUT /api/sports/:id
====================================================== */

router.put(
  "/:id",
  protectAdmin,
  upload.single("iconImage"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        if (req.file) deleteLocalFile(req.file.path);

        return errorResponse(res, "Invalid sport id", 400);
      }

      const sport = await Sport.findById(req.params.id);

      if (!sport) {
        if (req.file) deleteLocalFile(req.file.path);

        return errorResponse(res, "Sport not found", 404);
      }

      const nameBn = cleanText(req.body?.name_bn);
      const nameEn = cleanText(req.body?.name_en);
      const gameId = cleanText(req.body?.gameId);
      const order = Number(req.body?.order || 0);
      const removeOldImage = String(req.body?.removeOldImage) === "true";

      if (!nameBn || !nameEn || !gameId) {
        if (req.file) deleteLocalFile(req.file.path);

        return errorResponse(
          res,
          "Bangla name, English name and gameId are required",
          400,
        );
      }

      const oldImage = sport.iconImage;

      sport.name = {
        bn: nameBn,
        en: nameEn,
      };

      sport.gameId = gameId;

      sport.isActive =
        req.body?.isActive === undefined
          ? sport.isActive
          : toBool(req.body?.isActive);

      sport.order = Number.isFinite(order) ? order : 0;

      if (req.file) {
        sport.iconImage = filePath(req.file);
      } else if (removeOldImage) {
        sport.iconImage = "";
      }

      sport.syncStatus = "pending";

      await sport.save();

      if (req.file && oldImage && !String(oldImage).startsWith("http")) {
        deleteLocalFile(oldImage);
      }

      if (
        removeOldImage &&
        !req.file &&
        oldImage &&
        !String(oldImage).startsWith("http")
      ) {
        deleteLocalFile(oldImage);
      }

      return successResponse(
        res,
        "Sport updated successfully",
        formatSport(req, sport),
      );
    } catch (error) {
      if (req.file) deleteLocalFile(req.file.path);

      return errorResponse(res, error.message || "Server error", 500);
    }
  },
);

/* ======================================================
   DELETE SPORT
   DELETE /api/sports/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid sport id", 400);
    }

    const sport = await Sport.findByIdAndDelete(req.params.id);

    if (!sport) {
      return errorResponse(res, "Sport not found", 404);
    }

    if (sport.iconImage && !String(sport.iconImage).startsWith("http")) {
      deleteLocalFile(sport.iconImage);
    }

    return successResponse(
      res,
      "Sport deleted successfully",
      formatSport(req, sport),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
