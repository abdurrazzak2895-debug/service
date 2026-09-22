import express from "express";
import mongoose from "mongoose";
import axios from "axios";

import Game from "../models/Game.js";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const ORACLE_GAME_API_BASE =
  process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game";

const ORACLE_GAME_DATA_KEY = process.env.ORACLE_GAME_DATA_KEY || "1189baca156e1bbbecc3b26651a63565";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const toBool = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

const cleanText = (value = "") => String(value || "").trim();

const cleanProviderCode = (value = "") => cleanText(value).toUpperCase();

const validOracleImageTypes = ["thumbnail", "height", "original"];

const cleanOracleImageType = (value) => {
  if (validOracleImageTypes.includes(value)) return value;
  return "thumbnail";
};

const BOOLEAN_FIELDS = ["isHot", "isFavorites", "isLatest", "isAZ"];

const applyBooleanFlags = (target, source = {}) => {
  BOOLEAN_FIELDS.forEach((field) => {
    if (source[field] !== undefined) {
      target[field] = toBool(source[field]);
    }
  });
};

const normalizeOracleGames = (data) => {
  const games = Array.isArray(data?.games) ? data.games : [];

  return games
    .filter((game) => game?.game_uid)
    .map((game) => ({
      name: game.name || "",
      game_uid: String(game.game_uid || "").trim(),
      provider: game.provider || "",
      category: game.category || "",
      status: game.status,
      images: {
        original: game.original || "",
        height: game.height || "",
        thumbnail: game.thumbnail || "",
      },
      raw: game,
    }));
};

/* ======================================================
   FETCH ORACLE GAMES BY PROVIDER CODE
   GET /api/games/oracle/PG
====================================================== */

router.get("/oracle/:providerCode", protectAdmin, async (req, res) => {
  try {
    const providerCode = cleanProviderCode(req.params.providerCode);

    if (!providerCode) {
      return errorResponse(res, "providerCode is required.", 400);
    }

    const response = await axios.get(
      `${ORACLE_GAME_API_BASE}/${providerCode}`,
      {
        headers: {
          "x-oraclegamedata-key": ORACLE_GAME_DATA_KEY,
        },
        timeout: 30000,
      },
    );

    const games = normalizeOracleGames(response.data);

    return successResponse(res, "Oracle games fetched successfully.", {
      provider: response.data?.provider || null,
      games,
    });
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch Oracle games.",
      500,
    );
  }
});

/* ======================================================
   CREATE GAME
====================================================== */

router.post("/", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const { categoryId, providerDbId, gameUId, oracleImageType, status } =
      req.body || {};

    if (!categoryId || !isValidObjectId(categoryId)) {
      return errorResponse(res, "Valid categoryId is required.", 400);
    }

    if (!providerDbId || !isValidObjectId(providerDbId)) {
      return errorResponse(res, "Valid providerDbId is required.", 400);
    }

    if (!gameUId || !cleanText(gameUId)) {
      return errorResponse(res, "gameUId is required.", 400);
    }

    const category = await GameCategory.findById(categoryId);

    if (!category) {
      return errorResponse(res, "Game category not found.", 404);
    }

    const provider = await GameProvider.findOne({
      _id: providerDbId,
      categoryId,
    });

    if (!provider) {
      return errorResponse(
        res,
        "Game provider not found under this category.",
        404,
      );
    }

    const finalGameUId = cleanText(gameUId);

    const exists = await Game.findOne({
      providerDbId,
      gameUId: finalGameUId,
    });

    if (exists) {
      return errorResponse(
        res,
        "This game already exists under this provider.",
        400,
      );
    }

    const payload = {
      categoryId,
      providerDbId,
      gameUId: finalGameUId,
      oracleImageType: cleanOracleImageType(oracleImageType),
      image: req.file ? filePath(req.file) : "",
      status: status === "inactive" ? "inactive" : "active",
      syncStatus: "pending",
    };

    applyBooleanFlags(payload, req.body);

    const game = await Game.create(payload);

    return successResponse(res, "Game added successfully.", game, 201);
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(
        res,
        "This game already exists under this provider.",
        400,
      );
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL GAMES
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const {
      categoryId = "",
      providerDbId = "",
      gameUId = "",
      status = "",
      syncStatus = "",
      oracleImageType = "",
      page = 1,
      limit = 50,
    } = req.query || {};

    const query = {};

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return errorResponse(res, "Invalid categoryId.", 400);
      }

      query.categoryId = categoryId;
    }

    if (providerDbId) {
      if (!isValidObjectId(providerDbId)) {
        return errorResponse(res, "Invalid providerDbId.", 400);
      }

      query.providerDbId = providerDbId;
    }

    if (gameUId) {
      query.gameUId = { $regex: gameUId, $options: "i" };
    }

    if (status) query.status = status;
    if (syncStatus) query.syncStatus = syncStatus;

    if (oracleImageType && validOracleImageTypes.includes(oracleImageType)) {
      query.oracleImageType = oracleImageType;
    }

    BOOLEAN_FIELDS.forEach((field) => {
      if (req.query[field] !== undefined && req.query[field] !== "") {
        query[field] = toBool(req.query[field]);
      }
    });

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      Game.find(query)
        .populate("categoryId", "categoryName categoryTitle status")
        .populate("providerDbId", "providerName providerCode status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Game.countDocuments(query),
    ]);

    return successResponse(res, "Games fetched successfully.", {
      games,
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
   GET SINGLE GAME
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate("providerDbId", "providerName providerCode status");

    if (!game) {
      return errorResponse(res, "Game not found.", 404);
    }

    return successResponse(res, "Game fetched successfully.", game);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE GAME
====================================================== */

router.put("/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return errorResponse(res, "Game not found.", 404);
    }

    const { categoryId, providerDbId, gameUId, oracleImageType, status } =
      req.body || {};

    if (categoryId !== undefined) {
      if (!isValidObjectId(categoryId)) {
        return errorResponse(res, "Invalid categoryId.", 400);
      }

      const category = await GameCategory.findById(categoryId);

      if (!category) {
        return errorResponse(res, "Game category not found.", 404);
      }

      game.categoryId = categoryId;
    }

    if (providerDbId !== undefined) {
      if (!isValidObjectId(providerDbId)) {
        return errorResponse(res, "Invalid providerDbId.", 400);
      }

      const provider = await GameProvider.findById(providerDbId);

      if (!provider) {
        return errorResponse(res, "Game provider not found.", 404);
      }

      game.providerDbId = providerDbId;
    }

    if (gameUId !== undefined) {
      const newGameUId = cleanText(gameUId);

      if (!newGameUId) {
        return errorResponse(res, "gameUId is required.", 400);
      }

      const exists = await Game.findOne({
        _id: { $ne: game._id },
        providerDbId: game.providerDbId,
        gameUId: newGameUId,
      });

      if (exists) {
        return errorResponse(
          res,
          "This game already exists under this provider.",
          400,
        );
      }

      game.gameUId = newGameUId;
    }

    if (oracleImageType !== undefined) {
      game.oracleImageType = cleanOracleImageType(oracleImageType);
    }

    if (status !== undefined) {
      game.status = status === "inactive" ? "inactive" : "active";
    }

    applyBooleanFlags(game, req.body);

    if (req.file) {
      game.image = filePath(req.file);
    }

    game.syncStatus = "pending";

    await game.save();

    return successResponse(res, "Game updated successfully.", game);
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(
        res,
        "This game already exists under this provider.",
        400,
      );
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE CUSTOM IMAGE ONLY
====================================================== */

router.patch("/:id/remove-image", protectAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return errorResponse(res, "Game not found.", 404);
    }

    game.image = "";
    game.syncStatus = "pending";

    await game.save();

    return successResponse(res, "Game custom image removed.", game);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE GAME
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return errorResponse(res, "Game not found.", 404);
    }

    return successResponse(res, "Game deleted successfully.", game);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
