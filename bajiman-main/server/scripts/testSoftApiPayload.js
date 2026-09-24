#!/usr/bin/env node

import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { decryptPayload, encryptPayload } from "../services/nineWicketCrypto.js";

const first = (...names) =>
  names.map((name) => String(process.env[name] || "").trim()).find(Boolean) || "";

const token = first("SOFTAPI_TOKEN", "IGAMING_API_TOKEN", "NINEWICKET_TOKEN", "WORLD_CASINO_TOKEN");
const secret = first("SOFTAPI_SECRET", "IGAMING_API_SECRET", "NINEWICKET_SECRET", "WORLD_CASINO_SECRET");
const launchUrl = first("SOFTAPI_LAUNCH_URL", "IGAMING_LAUNCH_URL", "NINEWICKET_LAUNCH_URL");
const gameUid = first("SOFTAPI_GAME_UID", "IGAMING_GAME_UID", "NINEWICKET_GAME_UID", "GAME_UID");
const callback = first("SOFTAPI_CALLBACK_URL", "IGAMING_CALLBACK_URL", "NINEWICKET_CALLBACK_URL") || "https://example.com/api/softapi/callback";
const returnUrl = first("SOFTAPI_RETURN_URL", "IGAMING_RETURN_URL", "NINEWICKET_RETURN_URL") || "https://example.com/lobby";
const userId = first("SOFTAPI_TEST_USER_ID", "IGAMING_TEST_USER_ID") || "1001";
const balance = Number(process.env.SOFTAPI_TEST_BALANCE || process.env.IGAMING_TEST_BALANCE || "0");

if (!token) throw new Error("Missing provider token alias");
if (Buffer.byteLength(secret, "utf8") !== 32) {
  throw new Error("Provider secret must be exactly 32 UTF-8 bytes");
}
if (!gameUid) throw new Error("Missing game UID; set SOFTAPI_GAME_UID, IGAMING_GAME_UID, NINEWICKET_GAME_UID, or GAME_UID");
if (!Number.isFinite(balance) || balance < 0) throw new Error("Test balance must be a non-negative number");
if (!/^https:\/\//i.test(callback) || !/^https:\/\//i.test(returnUrl)) {
  throw new Error("Callback and return URLs must use HTTPS");
}

const timestamp = Date.now();
const plain = {
  user_id: Number(userId) || userId,
  balance,
  game_uid: gameUid,
  token,
  timestamp,
  return: returnUrl,
  callback,
};

const ciphertext = encryptPayload(plain);
const outer = { token, payload: ciphertext };
const roundTrip = decryptPayload(outer.payload);

assert.deepEqual(roundTrip, plain, "AES payload did not round-trip exactly");
assert.equal(outer.token, roundTrip.token, "Outer and plaintext tokens do not match");
assert.ok(Math.abs(Date.now() - roundTrip.timestamp) < 60_000, "Timestamp is not fresh");

const endpoint = launchUrl ? new URL(launchUrl) : null;
const fingerprint = crypto.createHash("sha256").update(ciphertext).digest("hex").slice(0, 16);

console.log(JSON.stringify({
  ok: true,
  mode: "dry-run-no-network",
  encryption: "AES-256-ECB-PKCS7-Base64",
  secretBytes: Buffer.byteLength(secret, "utf8"),
  tokenLength: token.length,
  outerTokenMatchesPlaintext: outer.token === roundTrip.token,
  timestampAgeMs: Date.now() - roundTrip.timestamp,
  gameUid: roundTrip.game_uid,
  balance: roundTrip.balance,
  callbackHttps: /^https:\/\//i.test(roundTrip.callback),
  returnHttps: /^https:\/\//i.test(roundTrip.return),
  launchEndpointConfigured: Boolean(endpoint),
  launchEndpoint: endpoint ? `${endpoint.origin}${endpoint.pathname}` : null,
  ciphertextBytes: Buffer.byteLength(ciphertext, "utf8"),
  ciphertextSha256Prefix: fingerprint,
  providerRequestSent: false,
}));
