import assert from "node:assert/strict";
import axios from "axios";
import { encryptPayload, decryptPayload } from "../services/nineWicketCrypto.js";

const apiBase = String(
  process.env.WORLD_CASINO_API_URL ||
    process.env.WORLD_CASINO_API_BASE ||
    "https://world-casino-api.com/api/v1",
).replace(/\/+$/, "");
const launchPath = String(
  process.env.WORLD_CASINO_LAUNCH_PATH || "/launch",
).startsWith("/")
  ? String(process.env.WORLD_CASINO_LAUNCH_PATH || "/launch")
  : `/${String(process.env.WORLD_CASINO_LAUNCH_PATH)}`;
const token = String(
  process.env.WORLD_CASINO_TOKEN || process.env.NINEWICKET_TOKEN || "",
).trim();
const secret = String(
  process.env.WORLD_CASINO_SECRET || process.env.NINEWICKET_SECRET || "",
);
const gameUid = String(process.env.WORLD_CASINO_TEST_GAME_UID || "").trim();
const userId = Number(process.env.WORLD_CASINO_TEST_USER_ID || "10001");
const balance = Number(process.env.WORLD_CASINO_TEST_BALANCE || "0");
const currency = String(
  process.env.WORLD_CASINO_TEST_CURRENCY || "BDT",
).trim().toUpperCase();
const optionsCheck = process.argv.includes("--options-check");
const redacted = (value) => {
  const text = String(value || "");
  return text ? `${text.slice(0, 3)}…${text.slice(-3)}` : "(missing)";
};

const validate = () => {
  assert.ok(token, "WORLD_CASINO_TOKEN/NINEWICKET_TOKEN is required");
  assert.equal(
    Buffer.byteLength(secret, "utf8"),
    32,
    "WORLD_CASINO_SECRET/NINEWICKET_SECRET must be exactly 32 UTF-8 bytes",
  );
  assert.ok(gameUid, "WORLD_CASINO_TEST_GAME_UID is required");
  assert.ok(Number.isSafeInteger(userId) && userId > 0, "test user ID must be positive");
  assert.ok(Number.isFinite(balance) && balance >= 0, "test balance must be non-negative");
  assert.match(currency, /^[A-Z0-9]{3,8}$/, "test currency is invalid");
};

const buildPayload = () => ({
  user_id: userId,
  balance,
  game_uid: gameUid,
  symbol: String(process.env.WORLD_CASINO_TEST_SYMBOL || "9W")
    .trim()
    .toUpperCase(),
  timestamp: Date.now(),
  return: String(
    process.env.WORLD_CASINO_RETURN_URL || "https://example.invalid/lobby",
  ),
  callback: String(
    process.env.WORLD_CASINO_CALLBACK_URL ||
      "https://example.invalid/api/callback/world-casino",
  ),
  currency_code: currency,
  language: String(process.env.WORLD_CASINO_TEST_LANGUAGE || "en").trim(),
  transfer_id: `dry-run-${Date.now()}`,
  token,
});

const main = async () => {
  validate();
  const plain = buildPayload();
  const encryptedPayload = encryptPayload(plain);
  const decoded = decryptPayload(encryptedPayload);
  assert.deepEqual(decoded, plain, "local encryption round-trip failed");

  const launchUrl = `${apiBase}${launchPath}`;
  const request = {
    method: "POST",
    url: launchUrl,
    headers: { "Content-Type": "application/json" },
    body: { token, payload: encryptedPayload },
  };

  const result = {
    ok: true,
    mode: "dry-run",
    requestWouldBe: {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: {
        token: redacted(token),
        payload: `<encrypted base64: ${encryptedPayload.length} chars>`,
      },
    },
    decodedPayloadForReview: {
      ...plain,
      token: redacted(token),
    },
    safety: {
      launchPostSent: false,
      walletStateChanged: false,
      providerSessionCreated: false,
      note: "Dry-run only constructs and locally verifies the request.",
    },
  };

  if (optionsCheck) {
    try {
      const response = await axios.options(launchUrl, { timeout: 10000 });
      result.optionsCheck = {
        attempted: true,
        status: response.status,
        allow: response.headers.allow || null,
        note: "OPTIONS does not submit a launch payload.",
      };
    } catch (error) {
      result.optionsCheck = {
        attempted: true,
        status: error.response?.status || null,
        allow: error.response?.headers?.allow || null,
        error: String(error.message || "OPTIONS failed"),
        note: "A failed OPTIONS check does not prove the POST contract is invalid.",
      };
    }
  }

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
