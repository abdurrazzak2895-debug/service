import assert from "node:assert/strict";
import axios from "axios";
import { encryptPayload, decryptPayload } from "../services/nineWicketCrypto.js";

const apiBase = String(
  process.env.WORLD_CASINO_API_URL ||
    process.env.WORLD_CASINO_API_BASE ||
    "https://world-casino-api.com/api/v1",
).replace(/\/+$/, "");
const token = String(
  process.env.WORLD_CASINO_TOKEN || process.env.NINEWICKET_TOKEN || "",
).trim();
const gameUid = String(process.env.WORLD_CASINO_TEST_GAME_UID || "13251").trim();
const userId = Number(process.env.WORLD_CASINO_TEST_USER_ID || "10001");
const currency = String(process.env.WORLD_CASINO_TEST_CURRENCY || "BDT").trim().toUpperCase();
const liveCatalog = process.argv.includes("--live-catalog");
const liveLaunch = process.argv.includes("--live-launch");
const dangerousLaunchAcknowledged =
  process.env.I_UNDERSTAND_LAUNCH_MAY_CREATE_SESSION === "1";

const assertSecret = () => {
  const secret = String(
    process.env.WORLD_CASINO_SECRET || process.env.NINEWICKET_SECRET || "",
  );
  assert.equal(
    Buffer.byteLength(secret, "utf8"),
    32,
    "WORLD_CASINO_SECRET/NINEWICKET_SECRET must be exactly 32 UTF-8 bytes",
  );
};

const redacted = (value) => {
  const text = String(value || "");
  return text ? `${text.slice(0, 3)}…${text.slice(-3)}` : "(missing)";
};

const launchPlainPayload = {
  user_id: userId,
  balance: 0,
  game_uid: gameUid,
  symbol: String(process.env.WORLD_CASINO_TEST_SYMBOL || "9W").trim().toUpperCase(),
  timestamp: Date.now(),
  return: String(
    process.env.WORLD_CASINO_RETURN_URL || "https://example.invalid/lobby",
  ),
  callback: String(
    process.env.WORLD_CASINO_CALLBACK_URL ||
      "https://example.invalid/api/callback/world-casino",
  ),
  currency_code: currency,
  language: String(process.env.WORLD_CASINO_TEST_LANGUAGE || "en"),
  transfer_id: `mock-${Date.now()}`,
};

const buildRequest = () => {
  assertSecret();
  const payload = encryptPayload({ ...launchPlainPayload, token });
  return {
    method: "POST",
    url: `${apiBase}/launch`,
    headers: { "Content-Type": "application/json" },
    body: { token, payload },
  };
};

const mockProviderResponse = {
  code: 0,
  msg: "success",
  data: {
    session_id: 123456,
    game_uid: gameUid,
    url: "https://provider.example.invalid/game/session/mock-session",
    after_amount: 0,
  },
};

const inspectResponse = (response) => {
  assert.equal(Number(response?.code), 0, "mock provider code should be 0");
  assert.equal(typeof response?.data?.url, "string");
  assert.ok(response.data.url.startsWith("https://"));
  assert.ok(response.data.session_id);
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "mock",
        apiBase,
        token: redacted(token),
        request: {
          method: "POST",
          path: "/launch",
          encryptedPayload: true,
          decodedPayloadForInspection: {
            ...launchPlainPayload,
            token: redacted(token),
          },
        },
        responseShape: {
          code: response.code,
          msg: response.msg,
          dataKeys: Object.keys(response.data),
          url: "<redacted mock URL>",
          session_id: response.data.session_id,
          game_uid: response.data.game_uid,
          after_amount: response.data.after_amount,
        },
        warning:
          "Mock only. No provider request and no wallet/session mutation were performed.",
      },
      null,
      2,
    ),
  );
};

const inspectCatalogReadOnly = async () => {
  assert.ok(token, "WORLD_CASINO_TOKEN/NINEWICKET_TOKEN is required");
  const response = await axios.get(`${apiBase}/providers`, {
    params: { token, currency_supported: 1 },
    timeout: 20000,
  });
  const items = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data?.data?.providers)
        ? response.data.data.providers
        : Array.isArray(response.data?.providers)
          ? response.data.providers
          : [];
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "live-catalog-read-only",
        status: response.status,
        providerCount: items.length,
        providerSample: items.slice(0, 5).map((item) => ({
          id: item.brand_id || item.brandId || item.id || null,
          name: item.name || item.provider_name || item.providerName || null,
        })),
        warning: "No launch request was sent.",
      },
      null,
      2,
    ),
  );
};

const runLiveLaunch = async () => {
  if (!dangerousLaunchAcknowledged) {
    throw new Error(
      "Refusing live launch. Set I_UNDERSTAND_LAUNCH_MAY_CREATE_SESSION=1 only after confirming the provider test account and game UID.",
    );
  }
  const request = buildRequest();
  const response = await axios.post(request.url, request.body, {
    headers: request.headers,
    timeout: 20000,
  });
  inspectResponse(response.data);
};

const main = async () => {
  if (liveLaunch) return runLiveLaunch();
  if (liveCatalog) return inspectCatalogReadOnly();

  const request = buildRequest();
  const decoded = decryptPayload(request.body.payload);
  assert.deepEqual(decoded, { ...launchPlainPayload, token });
  inspectResponse(mockProviderResponse);
};

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
