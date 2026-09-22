import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import PopularGame from "../models/PopularGame.js";

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

const formatPopularGame = (req, item) => {
  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    imageUrl: obj.image ? buildFileUrl(req, obj.image) : "",
  };
};

/* ======================================================
   CREATE POPULAR GAME
   POST /api/popular-games
====================================================== */

router.post("/", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const gameId = cleanText(req.body?.gameId);
    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!gameId) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Game ID is required", 400);
    }

    const exists = await PopularGame.findOne({ gameId });

    if (exists) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "This popular game already exists", 400);
    }

    const popularGame = await PopularGame.create({
      gameId,
      image: req.file ? filePath(req.file) : "",
      order: Number.isFinite(order) ? order : 0,
      status,
    });

    return successResponse(
      res,
      "Popular game created successfully",
      formatPopularGame(req, popularGame),
      201,
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    if (error?.code === 11000) {
      return errorResponse(res, "This popular game already exists", 400);
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL POPULAR GAMES - ADMIN
   GET /api/popular-games
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 50 } = req.query || {};

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.gameId = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      PopularGame.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      PopularGame.countDocuments(query),
    ]);

    return successResponse(res, "Popular games fetched successfully", {
      games: games.map((item) => formatPopularGame(req, item)),
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
   GET ACTIVE POPULAR GAMES - PUBLIC
   GET /api/popular-games/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const games = await PopularGame.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active popular games fetched successfully",
      games.map((item) => formatPopularGame(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE POPULAR GAME
   GET /api/popular-games/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid popular game id", 400);
    }

    const popularGame = await PopularGame.findById(req.params.id);

    if (!popularGame) {
      return errorResponse(res, "Popular game not found", 404);
    }

    return successResponse(
      res,
      "Popular game fetched successfully",
      formatPopularGame(req, popularGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE POPULAR GAME
   PUT /api/popular-games/:id
====================================================== */

router.put("/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Invalid popular game id", 400);
    }

    const popularGame = await PopularGame.findById(req.params.id);

    if (!popularGame) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Popular game not found", 404);
    }

    const gameId = cleanText(req.body?.gameId);
    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";
    const removeOldImage = String(req.body?.removeOldImage) === "true";

    const oldImage = popularGame.image;

    if (!gameId) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Game ID is required", 400);
    }

    const exists = await PopularGame.findOne({
      _id: { $ne: popularGame._id },
      gameId,
    });

    if (exists) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "This popular game already exists", 400);
    }

    popularGame.gameId = gameId;
    popularGame.order = Number.isFinite(order) ? order : 0;
    popularGame.status = status;

    if (req.file) {
      popularGame.image = filePath(req.file);
    } else if (removeOldImage) {
      popularGame.image = "";
    }

    await popularGame.save();

    if (req.file && oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    if (removeOldImage && !req.file && oldImage) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Popular game updated successfully",
      formatPopularGame(req, popularGame),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    if (error?.code === 11000) {
      return errorResponse(res, "This popular game already exists", 400);
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE POPULAR GAME IMAGE
   PATCH /api/popular-games/:id/remove-image
====================================================== */

router.patch("/:id/remove-image", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid popular game id", 400);
    }

    const popularGame = await PopularGame.findById(req.params.id);

    if (!popularGame) {
      return errorResponse(res, "Popular game not found", 404);
    }

    const oldImage = popularGame.image;

    popularGame.image = "";

    await popularGame.save();

    if (oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Popular game image removed successfully",
      formatPopularGame(req, popularGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE POPULAR GAME
   DELETE /api/popular-games/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid popular game id", 400);
    }

    const popularGame = await PopularGame.findByIdAndDelete(req.params.id);

    if (!popularGame) {
      return errorResponse(res, "Popular game not found", 404);
    }

    if (popularGame.image && !String(popularGame.image).startsWith("http")) {
      deleteLocalFile(popularGame.image);
    }

    return successResponse(
      res,
      "Popular game deleted successfully",
      formatPopularGame(req, popularGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
