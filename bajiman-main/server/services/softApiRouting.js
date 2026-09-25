import { launchSoftApiGame } from "./softApiService.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const verifiedGameUidMap = require("../config/softapi-sandbox-game-uid-map.json");

const configuredProviderCodes = (env = process.env) =>
  new Set(
    String(env.SOFTAPI_SANDBOX_PROVIDER_CODES || "")
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );

export const isSoftApiProvider = (provider = {}, env = process.env) =>
  configuredProviderCodes(env).has(
    String(provider.providerCode || "").trim().toUpperCase(),
  );

export const isSoftApiSandboxEnabled = (env = process.env) =>
  String(env.SOFTAPI_SANDBOX_LAUNCH_ENABLED || "").trim().toLowerCase() ===
  "true";

export const resolveSoftApiSandboxEnv = (env = process.env) => {
  const reuseWorldCasinoCredentials =
    String(env.SOFTAPI_SANDBOX_REUSE_WORLD_CASINO_CREDENTIALS || "")
      .trim()
      .toLowerCase() === "true";
  const sharedApiBase = reuseWorldCasinoCredentials
    ? env.NINEWICKET_LAUNCH_URL ||
      env.NINEWICKET_API_BASE ||
      env.WORLD_CASINO_API_BASE ||
      env.WORLD_CASINO_API_URL
    : "";

  return {
    SOFTAPI_TOKEN: String(
      env.SOFTAPI_SANDBOX_TOKEN ||
        (reuseWorldCasinoCredentials
          ? env.NINEWICKET_TOKEN || env.WORLD_CASINO_TOKEN
          : "") ||
        "",
    ).trim(),
    SOFTAPI_SECRET: String(
      env.SOFTAPI_SANDBOX_SECRET ||
        (reuseWorldCasinoCredentials
          ? env.NINEWICKET_SECRET || env.WORLD_CASINO_SECRET
          : "") ||
        "",
    ),
    SOFTAPI_LAUNCH_URL: String(
      env.SOFTAPI_SANDBOX_LAUNCH_URL || sharedApiBase || "",
    ).trim(),
    SOFTAPI_CALLBACK_URL: String(env.SOFTAPI_SANDBOX_CALLBACK_URL || "").trim(),
    SOFTAPI_RETURN_URL: String(env.SOFTAPI_SANDBOX_RETURN_URL || "").trim(),
    SOFTAPI_CURRENCY_CODE: String(
      env.SOFTAPI_SANDBOX_CURRENCY_CODE || "BDT",
    ).trim(),
    SOFTAPI_LANGUAGE: String(env.SOFTAPI_SANDBOX_LANGUAGE || "en").trim(),
  };
};

/**
 * Map a local catalog UID to the account-specific SoftAPI game code.
 * Expected JSON: { "PROVIDER_CODE": { "localGameUId": "softApiGameCode" } }
 * No fallback to production mappings, local UIDs, or inferred providers.
 */
export const resolveSoftApiGameUid = (
  providerCode,
  localGameUid,
  env = process.env,
) => {
  const normalizedProviderCode = String(providerCode || "").trim().toUpperCase();
  const normalizedLocalUid = String(localGameUid || "").trim();
  if (!normalizedProviderCode || !normalizedLocalUid) return "";
  if (!configuredProviderCodes(env).has(normalizedProviderCode)) return "";

  const configuredMapping = String(env.SOFTAPI_SANDBOX_GAME_UID_MAP || "").trim();
  let mapping = verifiedGameUidMap;
  if (configuredMapping) {
    try {
      mapping = JSON.parse(configuredMapping);
    } catch {
      throw new Error("SOFTAPI_SANDBOX_GAME_UID_MAP must be valid JSON");
    }
  }

  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    throw new Error("SOFTAPI_SANDBOX_GAME_UID_MAP must be a JSON object");
  }

  const providerGames = mapping[normalizedProviderCode];
  if (!providerGames || typeof providerGames !== "object" || Array.isArray(providerGames)) {
    return "";
  }

  const mappedUid = String(providerGames[normalizedLocalUid] || "").trim();
  return mappedUid.length > 0 && mappedUid.length <= 200 ? mappedUid : "";
};

/** Sandbox launcher cannot send a player's real wallet balance. */
export const launchSoftApiSandbox = (
  { userId, gameUid },
  { env = process.env, launcher = launchSoftApiGame } = {},
) =>
  launcher(
    { userId, balance: 0, gameUid },
    { env: resolveSoftApiSandboxEnv(env) },
  );

export default {
  isSoftApiProvider,
  isSoftApiSandboxEnabled,
  launchSoftApiSandbox,
  resolveSoftApiGameUid,
  resolveSoftApiSandboxEnv,
};
