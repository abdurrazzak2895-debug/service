import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import HotGame from "../models/HotGame.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const normalizeOrder = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (targetPath = "") => {
  try {
    if (!targetPath) return;
    if (String(targetPath).startsWith("http")) return;

    const fullPath = path.resolve(targetPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("HOT GAME FILE DELETE ERROR:", error.message);
  }
};

const formatHotGame = (req, item) => {
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    imageUrl: obj?.image ? buildFileUrl(req, obj.image) : "",
  };
};

/* ======================================================
   CREATE HOT GAME
   POST /api/hot-games
====================================================== */

router.post("/", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const gameId = cleanText(req.body?.gameId);
    const order = normalizeOrder(req.body?.order);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!gameId) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Game ID is required", 400);
    }

    const exists = await HotGame.findOne({ gameId });

    if (exists) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "This hot game already exists", 400);
    }

    const hotGame = await HotGame.create({
      gameId,
      image: req.file ? filePath(req.file) : "",
      order,
      status,
    });

    return successResponse(
      res,
      "Hot game created successfully",
      formatHotGame(req, hotGame),
      201,
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    if (error?.code === 11000) {
      return errorResponse(res, "This hot game already exists", 400);
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL HOT GAMES - ADMIN
   GET /api/hot-games
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
        $regex: String(search).trim(),
        $options: "i",
      };
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      HotGame.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      HotGame.countDocuments(query),
    ]);

    return successResponse(res, "Hot games fetched successfully", {
      games: games.map((item) => formatHotGame(req, item)),
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
   GET ACTIVE HOT GAMES - PUBLIC
   GET /api/hot-games/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const games = await HotGame.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active hot games fetched successfully",
      games.map((item) => formatHotGame(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE HOT GAME
   GET /api/hot-games/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid hot game id", 400);
    }

    const hotGame = await HotGame.findById(req.params.id);

    if (!hotGame) {
      return errorResponse(res, "Hot game not found", 404);
    }

    return successResponse(
      res,
      "Hot game fetched successfully",
      formatHotGame(req, hotGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE HOT GAME
   PUT /api/hot-games/:id
====================================================== */

router.put("/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Invalid hot game id", 400);
    }

    const hotGame = await HotGame.findById(req.params.id);

    if (!hotGame) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Hot game not found", 404);
    }

    const gameId = cleanText(req.body?.gameId);
    const order = normalizeOrder(req.body?.order);
    const status = req.body?.status === "inactive" ? "inactive" : "active";
    const removeOldImage = String(req.body?.removeOldImage) === "true";

    const oldImage = hotGame.image;

    if (!gameId) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "Game ID is required", 400);
    }

    const exists = await HotGame.findOne({
      _id: { $ne: hotGame._id },
      gameId,
    });

    if (exists) {
      if (req.file) deleteLocalFile(req.file.path);
      return errorResponse(res, "This hot game already exists", 400);
    }

    hotGame.gameId = gameId;
    hotGame.order = order;
    hotGame.status = status;

    if (req.file) {
      hotGame.image = filePath(req.file);
    } else if (removeOldImage) {
      hotGame.image = "";
    }

    await hotGame.save();

    if (req.file && oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    if (removeOldImage && !req.file && oldImage) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Hot game updated successfully",
      formatHotGame(req, hotGame),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    if (error?.code === 11000) {
      return errorResponse(res, "This hot game already exists", 400);
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE HOT GAME IMAGE
   PATCH /api/hot-games/:id/remove-image
====================================================== */

router.patch("/:id/remove-image", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid hot game id", 400);
    }

    const hotGame = await HotGame.findById(req.params.id);

    if (!hotGame) {
      return errorResponse(res, "Hot game not found", 404);
    }

    const oldImage = hotGame.image;

    hotGame.image = "";
    await hotGame.save();

    if (oldImage && !String(oldImage).startsWith("http")) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Hot game image removed successfully",
      formatHotGame(req, hotGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE HOT GAME
   DELETE /api/hot-games/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid hot game id", 400);
    }

    const hotGame = await HotGame.findByIdAndDelete(req.params.id);

    if (!hotGame) {
      return errorResponse(res, "Hot game not found", 404);
    }

    if (hotGame.image && !String(hotGame.image).startsWith("http")) {
      deleteLocalFile(hotGame.image);
    }

    return successResponse(
      res,
      "Hot game deleted successfully",
      formatHotGame(req, hotGame),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
