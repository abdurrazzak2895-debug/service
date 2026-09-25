import express from "express";
import mongoose from "mongoose";

import Game from "../models/Game.js";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { launchNineWicket } from "./nineWicketRoutes.js";
import {
  isYellowBatProvider,
  launchYellowBatGame,
} from "./yellowBatLaunchRoutes.js";
import {
  isSoftApiProvider,
  isSoftApiSandboxEnabled,
  launchSoftApiSandbox,
  resolveSoftApiGameUid,
} from "../services/softApiRouting.js";

const router = express.Router();
const clean = (value) => String(value || "").trim();
const configuredNineWicketProviderCodes = () =>
  new Set(
    String(process.env.NINEWICKET_PROVIDER_CODES || "WORLD_141,9W,9WICKET,9WICKETS")
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );
const isNineWicketProvider = (provider = {}) => {
  const code = clean(provider.providerCode).toUpperCase();
  const name = clean(provider.providerName).toLowerCase();
  return (
    configuredNineWicketProviderCodes().has(code) ||
    name === "9wicket" ||
    name === "9wickets"
  );
};
const findGame = async (catalogGameId, gameUid) => {
  if (mongoose.Types.ObjectId.isValid(catalogGameId)) {
    const byId = await Game.findOne({ _id: catalogGameId, status: "active" })
      .populate("providerDbId", "providerName providerCode status")
      .lean();
    if (byId) return byId;
  }
  if (gameUid) {
    return Game.findOne({ gameUId: gameUid, status: "active" })
      .populate("providerDbId", "providerName providerCode status")
      .lean();
  }
  return null;
};

const launchSoftApiSandboxGame = async (req, res, provider, game) => {
  if (!isSoftApiSandboxEnabled()) {
    return res.status(503).json({
      success: false,
      code: "SOFTAPI_SANDBOX_LAUNCH_DISABLED",
      message: "SoftAPI sandbox launch is disabled",
      providerCode: clean(provider.providerCode).toUpperCase(),
    });
  }

  let softApiGameUid;
  try {
    softApiGameUid = resolveSoftApiGameUid(provider.providerCode, game.gameUId);
  } catch (error) {
    return res.status(503).json({
      success: false,
      code: "SOFTAPI_GAME_MAPPING_INVALID",
      message: error.message,
      providerCode: clean(provider.providerCode).toUpperCase(),
    });
  }

  if (!softApiGameUid) {
    return res.status(409).json({
      success: false,
      code: "SOFTAPI_GAME_MAPPING_MISSING",
      message: "This catalog game has no explicit SoftAPI sandbox game-code mapping",
      providerCode: clean(provider.providerCode).toUpperCase(),
      catalogGameUid: clean(game.gameUId),
    });
  }

  const user = await User.findById(req.user.id).select("userId isActive");
  if (!user) {
    return res.status(404).json({
      success: false,
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }
  if (user.isActive !== true) {
    return res.status(403).json({
      success: false,
      code: "USER_INACTIVE",
      message: "Your account is not active",
    });
  }

  const numericUserId = Number(String(user.userId || "").trim());
  if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) {
    return res.status(422).json({
      success: false,
      code: "SOFTAPI_USER_ID_INVALID",
      message: "The account does not have a valid numeric SoftAPI user ID",
    });
  }

  try {
    const result = await launchSoftApiSandbox({
      userId: numericUserId,
      gameUid: softApiGameUid,
    });
    return res.json({
      success: true,
      provider: "softapi-sandbox",
      providerCode: clean(provider.providerCode).toUpperCase(),
      gameUrl: result.gameUrl,
      launch_url: result.gameUrl,
      game_uid: softApiGameUid,
      walletMode: "sandbox-zero-balance",
    });
  } catch (error) {
    console.error("SoftAPI sandbox launch failed:", String(error?.message || "unknown").slice(0, 160));
    return res.status(502).json({
      success: false,
      code: "SOFTAPI_SANDBOX_LAUNCH_FAILED",
      message: "Unable to open this sandbox game right now",
      providerCode: clean(provider.providerCode).toUpperCase(),
    });
  }
};

/**
 * Dispatch using the provider and game from the server-side active catalog.
 * SoftAPI sandbox requires explicit provider allow-list + game mapping.
 */
router.post("/launch", protectUser, async (req, res, next) => {
  try {
    const requestedGameUid = clean(
      req.body?.game_uid || req.body?.gameID || req.body?.gameId,
    );
    const catalogGameId = clean(req.body?.catalogGameId);
    const game = await findGame(catalogGameId, requestedGameUid);
    if (!game) {
      return res.status(404).json({
        success: false,
        code: "GAME_NOT_FOUND",
        message: "Game not found in the active catalog",
      });
    }

    const provider = game.providerDbId || {};
    const catalogProviderCode = clean(provider.providerCode).toUpperCase();
    const requestedProviderCode = clean(req.body?.providerCode).toUpperCase();
    if (requestedProviderCode && requestedProviderCode !== catalogProviderCode) {
      return res.status(409).json({
        success: false,
        code: "PROVIDER_MISMATCH",
        message: "The requested provider does not match the catalog game",
        providerCode: catalogProviderCode,
        providerName: clean(provider.providerName),
      });
    }

    if (isNineWicketProvider(provider)) {
      // Use the server-side catalog UID, not a client-supplied UID, after the
      // provider has been validated. This prevents cross-provider UID routing.
      req.body = {
        ...req.body,
        gameID: clean(game.gameUId),
        game_uid: clean(game.gameUId),
        gameId: clean(game.gameUId),
      };
      return launchNineWicket(req, res, next);
    }

    // Preserve the existing dedicated adapter for Yellow Bat.
    if (isYellowBatProvider(provider)) {
      req.body = {
        ...req.body,
        gameID: clean(game.gameUId),
        game_uid: clean(game.gameUId),
        gameId: clean(game.gameUId),
      };
      return launchYellowBatGame(req, res);
    }

    // SoftAPI is considered only after all existing dedicated providers.
    if (isSoftApiProvider(provider)) {
      return launchSoftApiSandboxGame(req, res, provider, game);
    }

    return res.status(501).json({
      success: false,
      code: "PROVIDER_LAUNCH_NOT_CONFIGURED",
      message: `Launch integration is not configured for ${clean(provider.providerName) || catalogProviderCode || "this provider"}`,
      providerCode: catalogProviderCode,
      providerName: clean(provider.providerName),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
