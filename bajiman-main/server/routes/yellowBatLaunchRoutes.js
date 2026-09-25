import express from "express";
import crypto from "node:crypto";
import axios from "axios";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { encryptPayload } from "../services/nineWicketCrypto.js";

const router = express.Router();

const enabled = () =>
  String(process.env.WORLD_CASINO_YELLOW_BAT_ENABLED || "false").toLowerCase() ===
  "true";
const providerCodes = () =>
  new Set(
    String(process.env.WORLD_CASINO_YELLOW_BAT_PROVIDER_CODES || "WORLD_166")
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );
const apiBase = () =>
  String(
    process.env.WORLD_CASINO_YELLOW_BAT_API_BASE ||
      process.env.WORLD_CASINO_API_URL ||
      process.env.WORLD_CASINO_API_BASE ||
      "https://world-casino-api.com/api/v1",
  ).replace(/\/+$/, "");
const launchPath = () => {
  const value = String(
    process.env.WORLD_CASINO_YELLOW_BAT_LAUNCH_PATH || "/launch",
  ).trim();
  return value.startsWith("/") ? value : `/${value}`;
};
const token = () =>
  String(
    process.env.WORLD_CASINO_YELLOW_BAT_TOKEN ||
      process.env.WORLD_CASINO_TOKEN ||
      process.env.NINEWICKET_TOKEN ||
      "",
  ).trim();
const symbol = () =>
  String(process.env.WORLD_CASINO_YELLOW_BAT_SYMBOL || "9W")
    .trim()
    .toUpperCase();
const currency = () =>
  String(
    process.env.WORLD_CASINO_YELLOW_BAT_CURRENCY ||
      process.env.WORLD_CASINO_CURRENCY ||
      "BDT",
  )
    .trim()
    .toUpperCase();
const returnUrl = () =>
  String(
    process.env.WORLD_CASINO_YELLOW_BAT_RETURN_URL ||
      process.env.WORLD_CASINO_RETURN_URL ||
      "",
  ).trim();
const callbackUrl = () =>
  String(
    process.env.WORLD_CASINO_YELLOW_BAT_CALLBACK_URL ||
      process.env.WORLD_CASINO_CALLBACK_URL ||
      "",
  ).trim();
const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};
const numericUserId = (user) => {
  const digits = String(user.userId || "").replace(/\D/g, "");
  if (digits) return Number(digits.slice(-9));
  return parseInt(String(user._id).replace(/\D/g, "").slice(-9), 10) || 1;
};
const extractLaunch = (data) => {
  const payload = data?.data || data;
  return {
    url: payload?.url || payload?.launch_url || payload?.launchUrl || payload?.game_url || "",
    sessionId: payload?.session_id || payload?.sessionId || null,
    providerBalance: payload?.after_amount ?? payload?.balance ?? null,
  };
};
const requireConfig = () => {
  if (!enabled()) {
    const error = new Error("Yellow Bat launch is disabled");
    error.status = 503;
    error.code = "YELLOW_BAT_LAUNCH_DISABLED";
    throw error;
  }
  if (!token()) {
    const error = new Error("World Casino token is not configured");
    error.status = 503;
    error.code = "YELLOW_BAT_TOKEN_MISSING";
    throw error;
  }
  if (!/^https:\/\//i.test(returnUrl()) || returnUrl().includes("?")) {
    const error = new Error("Yellow Bat return URL must be HTTPS without a query string");
    error.status = 503;
    error.code = "YELLOW_BAT_RETURN_URL_INVALID";
    throw error;
  }
  if (!/^https:\/\//i.test(callbackUrl())) {
    const error = new Error("Yellow Bat callback URL must be HTTPS");
    error.status = 503;
    error.code = "YELLOW_BAT_CALLBACK_URL_INVALID";
    throw error;
  }
};

export const isYellowBatProvider = (provider = {}) =>
  providerCodes().has(String(provider.providerCode || "").trim().toUpperCase());

export const launchYellowBatGame = async (req, res) => {
  try {
    requireConfig();
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
    const user = await User.findById(req.user.id).select(
      "userId balance currency isActive",
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isActive !== true) {
      return res.status(403).json({ success: false, message: "Your account is not active" });
    }

    // Safe initial adapter behavior: never debit the local wallet. The provider
    // contract must be confirmed before enabling transfer/seamless reconciliation.
    const launchAmount = money(process.env.WORLD_CASINO_YELLOW_BAT_LAUNCH_BALANCE || 0);
    const plain = {
      user_id: numericUserId(user),
      balance: launchAmount,
      game_uid: gameUid,
      symbol: symbol(),
      timestamp: Date.now(),
      return: returnUrl(),
      callback: callbackUrl(),
      currency_code: currency(),
      language: String(process.env.WORLD_CASINO_YELLOW_BAT_LANGUAGE || "en").trim(),
      transfer_id: `yellow-bat-${numericUserId(user)}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      token: token(),
    };
    const response = await axios.post(
      `${apiBase()}${launchPath()}`,
      { token: token(), payload: encryptPayload(plain) },
      { headers: { "Content-Type": "application/json" }, timeout: 20000 },
    );
    const result = response.data || {};
    if (Number(result.code) !== 0) {
      return res.status(502).json({
        success: false,
        code: "YELLOW_BAT_LAUNCH_REJECTED",
        message: String(result.msg || result.message || "Yellow Bat launch rejected").slice(0, 240),
      });
    }
    const launch = extractLaunch(result);
    if (!launch.url || !/^https:\/\//i.test(String(launch.url))) {
      return res.status(502).json({
        success: false,
        code: "YELLOW_BAT_LAUNCH_URL_MISSING",
        message: "Yellow Bat did not return a valid HTTPS launch URL",
      });
    }
    return res.json({
      success: true,
      provider: "yellow-bat",
      gameUrl: launch.url,
      launch_url: launch.url,
      sessionId: launch.sessionId,
      data: { ...result.data, game_uid: gameUid },
      walletMode: "read-only-zero-balance",
    });
  } catch (error) {
    const status = Number(error.status || error.response?.status || 502);
    return res.status(status).json({
      success: false,
      code: error.code || "YELLOW_BAT_LAUNCH_FAILED",
      message: error.code ? error.message : "Unable to open Yellow Bat right now",
    });
  }
};

router.post("/launch", protectUser, launchYellowBatGame);
export default router;
