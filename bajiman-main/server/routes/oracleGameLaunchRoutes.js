import crypto from "node:crypto";
import axios from "axios";
import User from "../models/User.js";

const oracleLaunchUrl = () =>
  String(
    process.env.ORACLE_GAME_LAUNCH_URL ||
      "https://oraclegames.net/api/game/launch",
  ).trim();

const oracleLaunchKey = () => String(process.env.ORACLE_LAUNCH_KEY || "").trim();

const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.floor(amount) : 0;
};

const makeGamePlayName = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes, (byte) => letters[byte % letters.length]).join("");
};

const isValidGamePlayName = (value = "") => /^[a-z]{10}$/.test(String(value).trim());

const getOrCreateGamePlayName = async (user) => {
  if (isValidGamePlayName(user.userGamePlayName)) {
    return String(user.userGamePlayName).trim();
  }

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const userGamePlayName = makeGamePlayName();
    if (!(await User.exists({ userGamePlayName }))) {
      user.userGamePlayName = userGamePlayName;
      await user.save();
      return userGamePlayName;
    }
  }

  throw new Error("Failed to generate a unique provider username");
};

const extractLaunchUrl = (data) =>
  data?.launch_url ||
  data?.launchUrl ||
  data?.gameUrl ||
  data?.url ||
  data?.data?.launch_url ||
  data?.data?.launchUrl ||
  data?.data?.gameUrl ||
  data?.data?.url ||
  "";

const oracleProviderCodes = () =>
  new Set(
    String(process.env.ORACLE_PROVIDER_CODES || "WORLD_92,WORLD_133")
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );

export const isOracleProvider = (provider = {}) =>
  oracleProviderCodes().has(String(provider.providerCode || "").trim().toUpperCase());

export const launchOracleGame = async (req, res) => {
  const gameUid = String(
    req.body?.game_uid || req.body?.gameID || req.body?.gameId || "",
  ).trim();

  if (!gameUid) {
    return res.status(400).json({
      success: false,
      code: "GAME_UID_REQUIRED",
      message: "game_uid is required",
    });
  }

  const launchUrl = oracleLaunchUrl();
  const launchKey = oracleLaunchKey();
  if (!launchKey) {
    return res.status(503).json({
      success: false,
      code: "ORACLE_LAUNCH_NOT_CONFIGURED",
      message: "The provider launch integration is not configured",
    });
  }

  try {
    const user = await User.findById(req.user.id).select(
      "userId phone balance isActive currency userGamePlayName",
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isActive !== true) {
      return res.status(403).json({ success: false, message: "Your account is not active" });
    }

    const username = await getOrCreateGamePlayName(user);
    const payload = {
      amount: String(money(user.balance)),
      username,
      game_uid: gameUid,
    };

    const response = await axios.post(launchUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-oracle-key": launchKey,
      },
      timeout: 30000,
    });

    const gameUrl = extractLaunchUrl(response.data);
    if (!gameUrl || typeof gameUrl !== "string") {
      return res.status(502).json({
        success: false,
        code: "ORACLE_LAUNCH_URL_MISSING",
        message: "The provider did not return a launch URL",
      });
    }

    return res.json({
      success: true,
      gameUrl,
      launch_url: gameUrl,
      provider: "oracle",
      data: {
        launch_url: gameUrl,
        gameUrl,
        game_uid: gameUid,
        username,
        amount: payload.amount,
      },
    });
  } catch (error) {
    console.error("Oracle game launch error:", {
      status: error?.response?.status || null,
      message: error?.response?.data?.message || error?.message || "unknown",
    });

    return res.status(error?.response?.status || 502).json({
      success: false,
      code: "ORACLE_LAUNCH_FAILED",
      message:
        error?.response?.data?.message ||
        "Unable to open this provider game right now",
    });
  }
};
