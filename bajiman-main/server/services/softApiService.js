import axios from "axios";
import { encryptSoftApiPayload, requireSoftApiSecret } from "./softApiCrypto.js";

const first = (...values) =>
  values.map((value) => String(value || "").trim()).find(Boolean) || "";

export const resolveSoftApiConfig = (env = process.env) => ({
  token: first(env.SOFTAPI_TOKEN, env.IGAMING_API_TOKEN),
  secret: String(env.SOFTAPI_SECRET || env.IGAMING_API_SECRET || ""),
  launchUrl: first(env.SOFTAPI_LAUNCH_URL, env.IGAMING_LAUNCH_URL),
  callbackUrl: first(env.SOFTAPI_CALLBACK_URL, env.IGAMING_CALLBACK_URL),
  returnUrl: first(env.SOFTAPI_RETURN_URL, env.IGAMING_RETURN_URL),
  currencyCode: first(env.SOFTAPI_CURRENCY_CODE, env.IGAMING_CURRENCY_CODE, "BDT").toUpperCase(),
  language: first(env.SOFTAPI_LANGUAGE, env.IGAMING_LANGUAGE, "en"),
});

const httpsUrl = (value, field) => {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error(`${field} must be a valid HTTPS URL`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hash) {
    throw new Error(`${field} must be a valid HTTPS URL without credentials or a fragment`);
  }
  return parsed.toString();
};

const safeUserId = (value) => {
  const userId = Number(value);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("SoftAPI user_id must be a positive safe integer");
  }
  return userId;
};

const safeAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000_000) {
    throw new Error("SoftAPI balance must be a finite non-negative amount");
  }
  return amount;
};

export const buildSoftApiLaunchRequest = (
  { userId, balance, gameUid, callbackUrl, returnUrl, currencyCode, language },
  { env = process.env, now = Date.now() } = {},
) => {
  const config = resolveSoftApiConfig(env);
  if (!config.token) throw new Error("SOFTAPI_TOKEN or IGAMING_API_TOKEN is required");
  requireSoftApiSecret(config.secret);
  if (!config.launchUrl) {
    throw new Error("SOFTAPI_LAUNCH_URL or IGAMING_LAUNCH_URL must come from the provider portal");
  }
  const launchUrl = httpsUrl(config.launchUrl, "SoftAPI launch URL");
  const resolvedCallback = httpsUrl(callbackUrl || config.callbackUrl, "SoftAPI callback URL");
  const resolvedReturn = httpsUrl(returnUrl || config.returnUrl, "SoftAPI return URL");
  const resolvedGameUid = String(gameUid || "").trim();
  if (!resolvedGameUid || resolvedGameUid.length > 200) {
    throw new Error("SoftAPI game_uid is required and must be at most 200 characters");
  }
  if (!Number.isSafeInteger(now) || now <= 0) {
    throw new Error("SoftAPI launch timestamp must be a positive Unix-millisecond integer");
  }
  const resolvedCurrency = first(currencyCode, config.currencyCode).toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(resolvedCurrency)) {
    throw new Error("SoftAPI currency_code is invalid");
  }
  const plain = {
    user_id: safeUserId(userId),
    balance: safeAmount(balance),
    game_uid: resolvedGameUid,
    token: config.token,
    timestamp: now,
    return: resolvedReturn,
    callback: resolvedCallback,
    language: first(language, config.language),
    currency_code: resolvedCurrency,
  };
  return {
    url: launchUrl,
    body: {
      token: config.token,
      payload: encryptSoftApiPayload(plain, config.secret),
    },
  };
};

export const launchSoftApiGame = async (
  input,
  { env = process.env, httpClient = axios, timeoutMs = 20_000, now = Date.now() } = {},
) => {
  const request = buildSoftApiLaunchRequest(input, { env, now });
  const response = await httpClient.post(request.url, request.body, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    timeout: timeoutMs,
  });
  const result = response?.data || {};
  if (Number(result.code) !== 0) {
    throw new Error(`SoftAPI launch rejected${result.msg ? `: ${String(result.msg).slice(0, 240)}` : ""}`);
  }
  const gameUrl = String(result.data?.url || "");
  if (!gameUrl) throw new Error("SoftAPI launch response did not include data.url");
  httpsUrl(gameUrl, "SoftAPI game URL");
  return { gameUrl, providerResponse: result };
};

export default { buildSoftApiLaunchRequest, launchSoftApiGame, resolveSoftApiConfig };
