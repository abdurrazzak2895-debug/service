import express from "express";
import mongoose from "mongoose";

import Game from "../models/Game.js";
import protectUser from "../middleware/protectUser.js";
import { launchNineWicket } from "./nineWicketRoutes.js";

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

/**
 * Dispatch a launch using the provider attached to the catalog record.
 *
 * Only 9Wicket has a provider implementation in this repository today. The
 * important safety property is that KA/YGR/etc. are rejected explicitly
 * rather than being sent to /api/9wicket/launch and rendered as a black iframe.
 * Add a provider-specific handler here when that provider's launch contract is
 * configured and tested.
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

    if (!isNineWicketProvider(provider)) {
      return res.status(501).json({
        success: false,
        code: "PROVIDER_LAUNCH_NOT_CONFIGURED",
        message: `Launch integration is not configured for ${clean(provider.providerName) || catalogProviderCode || "this provider"}`,
        providerCode: catalogProviderCode,
        providerName: clean(provider.providerName),
      });
    }

    // Use the server-side catalog UID, not a client-supplied UID, after the
    // provider has been validated. This prevents cross-provider UID routing.
    req.body = {
      ...req.body,
      gameID: clean(game.gameUId),
      game_uid: clean(game.gameUId),
      gameId: clean(game.gameUId),
    };

    return launchNineWicket(req, res, next);
  } catch (error) {
    return next(error);
  }
});

export default router;
