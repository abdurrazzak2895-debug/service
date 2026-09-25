#!/usr/bin/env node
import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { buildSoftApiLaunchRequest, resolveSoftApiConfig } from "../services/softApiService.js";
import { decryptSoftApiPayload } from "../services/softApiCrypto.js";

const config = resolveSoftApiConfig();
if (!config.token) throw new Error("Set SOFTAPI_TOKEN or IGAMING_API_TOKEN");
if (!config.secret) throw new Error("Set SOFTAPI_SECRET or IGAMING_API_SECRET");
if (!config.launchUrl) throw new Error("Set SOFTAPI_LAUNCH_URL or IGAMING_LAUNCH_URL from the provider portal");
if (!config.callbackUrl) throw new Error("Set SOFTAPI_CALLBACK_URL or IGAMING_CALLBACK_URL");
if (!config.returnUrl) throw new Error("Set SOFTAPI_RETURN_URL or IGAMING_RETURN_URL");

const gameUid = String(process.env.SOFTAPI_GAME_UID || process.env.IGAMING_GAME_UID || "").trim();
if (!gameUid) throw new Error("Set SOFTAPI_GAME_UID or IGAMING_GAME_UID from the provider catalog");
const userId = Number(process.env.SOFTAPI_TEST_USER_ID || process.env.IGAMING_TEST_USER_ID || "1001");
const balance = Number(process.env.SOFTAPI_TEST_BALANCE || process.env.IGAMING_TEST_BALANCE || "0");
if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Test user ID must be a positive safe integer");
if (!Number.isFinite(balance) || balance < 0) throw new Error("Test balance must be a non-negative number");

const request = buildSoftApiLaunchRequest(
  { userId, balance, gameUid },
  { now: Date.now() },
);
const plain = decryptSoftApiPayload(request.body.payload, config.secret);
assert.equal(request.body.token, plain.token, "Outer and plaintext tokens must match");
assert.equal(plain.user_id, userId);
assert.equal(plain.game_uid, gameUid);
assert.ok(Math.abs(Date.now() - plain.timestamp) < 60_000, "Launch timestamp must be fresh");

const launchUrl = new URL(request.url);
const fingerprint = crypto.createHash("sha256").update(request.body.payload).digest("hex").slice(0, 16);
console.log(JSON.stringify({
  ok: true,
  mode: "dry-run-no-network",
  encryption: "AES-256-ECB-PKCS7-Base64",
  secretBytes: Buffer.byteLength(config.secret, "utf8"),
  tokenLength: config.token.length,
  outerTokenMatchesPlaintext: request.body.token === plain.token,
  timestampAgeMs: Date.now() - plain.timestamp,
  gameUid: plain.game_uid,
  balance: plain.balance,
  currencyCode: plain.currency_code,
  callbackHttps: new URL(plain.callback).protocol === "https:",
  returnHttps: new URL(plain.return).protocol === "https:",
  launchEndpoint: `${launchUrl.origin}${launchUrl.pathname}`,
  ciphertextBytes: Buffer.byteLength(request.body.payload, "utf8"),
  ciphertextSha256Prefix: fingerprint,
  providerRequestSent: false,
}));
