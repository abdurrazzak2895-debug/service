#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  buildSoftApiLaunchRequest,
  launchSoftApiGame,
  resolveSoftApiConfig,
} from "../services/softApiService.js";
import {
  decryptSoftApiPayload,
  encryptSoftApiPayload,
  requireSoftApiSecret,
  resolveSoftApiSecret,
} from "../services/softApiCrypto.js";
import { parseSoftApiCallback } from "../services/softApiCallback.js";
import SoftApiCallbackEvent from "../models/SoftApiCallbackEvent.js";

const token = "synthetic-softapi-token";
const secret = "0123456789abcdef0123456789abcdef";
const env = {
  SOFTAPI_TOKEN: token,
  SOFTAPI_SECRET: secret,
  SOFTAPI_LAUNCH_URL: "https://portal.example.test/launch/key",
  SOFTAPI_CALLBACK_URL: "https://casino.example.test/api/softapi/callback",
  SOFTAPI_RETURN_URL: "https://casino.example.test/lobby",
  SOFTAPI_CURRENCY_CODE: "BDT",
  SOFTAPI_LANGUAGE: "en",
};
const now = 1_710_000_000_000;

const request = buildSoftApiLaunchRequest(
  { userId: 1001, balance: 0, gameUid: "11539" },
  { env, now },
);
assert.equal(request.url, env.SOFTAPI_LAUNCH_URL);
assert.equal(request.body.token, token);
const plain = decryptSoftApiPayload(request.body.payload, secret);
assert.deepEqual(plain, {
  user_id: 1001,
  balance: 0,
  game_uid: "11539",
  token,
  timestamp: now,
  return: env.SOFTAPI_RETURN_URL,
  callback: env.SOFTAPI_CALLBACK_URL,
  language: "en",
  currency_code: "BDT",
});
assert.equal(request.body.token, plain.token);
let mockedRequestCount = 0;
const launchResult = await launchSoftApiGame(
  { userId: 1001, balance: 0, gameUid: "11539" },
  {
    env,
    now,
    httpClient: {
      post: async (url, body, options) => {
        mockedRequestCount += 1;
        assert.equal(url, env.SOFTAPI_LAUNCH_URL);
        assert.equal(body.token, token);
        assert.equal(options.timeout, 20_000);
        return { data: { code: 0, msg: "OK", data: { url: "https://games.example.test/session/abc" } } };
      },
    },
  },
);
assert.equal(launchResult.gameUrl, "https://games.example.test/session/abc");
assert.equal(mockedRequestCount, 1);
assert.equal(SoftApiCallbackEvent.collection.collectionName, "softapi_callback_events");
assert.equal(SoftApiCallbackEvent.schema.path("balance"), undefined);
assert.equal(SoftApiCallbackEvent.schema.path("user"), undefined);
assert.equal(
  SoftApiCallbackEvent.schema.indexes().filter(([keys]) => keys.eventKey === 1).length,
  1,
  "The callback store must have exactly one unique eventKey index",
);

assert.throws(
  () => buildSoftApiLaunchRequest(
    { userId: 1001, balance: 0, gameUid: "11539" },
    { env: { NINEWICKET_TOKEN: token, NINEWICKET_SECRET: secret, NINEWICKET_LAUNCH_URL: env.SOFTAPI_LAUNCH_URL }, now },
  ),
  /SOFTAPI_TOKEN or IGAMING_API_TOKEN/,
  "SoftAPI must not silently reuse NineWicket credentials",
);
assert.equal(resolveSoftApiConfig({ IGAMING_API_TOKEN: token }).token, token);
assert.equal(
  resolveSoftApiSecret({ NINEWICKET_SECRET: secret }),
  "",
  "SoftAPI callback must not silently use NineWicket credentials",
);
assert.equal(
  resolveSoftApiSecret({
    SOFTAPI_SANDBOX_LAUNCH_ENABLED: "true",
    SOFTAPI_SANDBOX_SECRET: secret,
  }),
  secret,
  "enabled sandbox callbacks may use their dedicated sandbox secret",
);
assert.equal(
  resolveSoftApiSecret({
    SOFTAPI_SANDBOX_LAUNCH_ENABLED: "true",
    SOFTAPI_SANDBOX_SECRET: secret,
    SOFTAPI_SECRET: "fedcba9876543210fedcba9876543210",
  }),
  secret,
  "the dedicated sandbox secret must win when the sandbox route is enabled",
);
const sharedCallbackEnv = {
  SOFTAPI_SANDBOX_LAUNCH_ENABLED: "true",
  SOFTAPI_SANDBOX_REUSE_WORLD_CASINO_CREDENTIALS: "true",
  NINEWICKET_SECRET: secret,
};
assert.equal(resolveSoftApiSecret(sharedCallbackEnv), secret);
const disabledSharedCallbackSecret = resolveSoftApiSecret({
    SOFTAPI_SANDBOX_REUSE_WORLD_CASINO_CREDENTIALS: "true",
    NINEWICKET_SECRET: secret,
  });
assert.equal(disabledSharedCallbackSecret, "");
assert.throws(
  () => requireSoftApiSecret(disabledSharedCallbackSecret),
  /exactly 32 UTF-8 bytes/,
  "the shared secret fallback must remain gated on sandbox launch being enabled",
);
assert.throws(
  () => buildSoftApiLaunchRequest(
    { userId: 1001, balance: 0, gameUid: "11539" },
    { env: { ...env, SOFTAPI_LAUNCH_URL: "http://portal.example.test/launch" }, now },
  ),
  /HTTPS URL/,
);
assert.throws(
  () => buildSoftApiLaunchRequest(
    { userId: 1001, balance: 0, gameUid: "11539" },
    { env: { ...env, SOFTAPI_SECRET: "short" }, now },
  ),
  /exactly 32 UTF-8 bytes/,
);

const sample = {
  game_id: 42,
  game_uid: "11539",
  game_round: "round-abc",
  member_account: "1001",
  bet_amount: 10.5,
  win_amount: 0,
  timestamp: now,
  notify_only: true,
  serial_number: "serial-abc",
  game_name: "Example Slot",
};
const callback = parseSoftApiCallback(sample, { secret, encryptionMode: "optional" });
assert.equal(callback.provider, "softapi");
assert.equal(callback.notifyOnly, true);
assert.equal(callback.betAmount, 10.5);
assert.equal(callback.winAmount, 0);
assert.equal(callback.idempotencySource, "serial_number");
assert.equal(callback.eventKey, parseSoftApiCallback(sample, { secret, encryptionMode: "optional" }).eventKey);

const encrypted = {
  payload: encryptSoftApiPayload(sample, secret),
  timestamp: now,
};
const encryptedCallback = parseSoftApiCallback(encrypted, { secret });
assert.equal(encryptedCallback.encrypted, true);
assert.equal(encryptedCallback.eventKey, callback.eventKey);

const noSerial = { ...sample, serial_number: undefined };
const noSerialCallback = parseSoftApiCallback(noSerial, { secret, encryptionMode: "optional" });
assert.equal(noSerialCallback.idempotencySource, "game_round_event");
assert.equal(noSerialCallback.eventKey, parseSoftApiCallback(noSerial, { secret, encryptionMode: "optional" }).eventKey);
assert.notEqual(noSerialCallback.eventKey, callback.eventKey);
const followUpSettlement = parseSoftApiCallback({ ...noSerial, bet_amount: 10.5, win_amount: 18 }, { secret, encryptionMode: "optional" });
assert.notEqual(followUpSettlement.eventKey, noSerialCallback.eventKey, "A distinct settlement in the same round must not be discarded as a duplicate");

assert.throws(() => parseSoftApiCallback(sample, { secret }), /encrypted.*required/i);
assert.throws(() => parseSoftApiCallback({ ...sample, notify_only: false }, { secret, encryptionMode: "optional" }), /notify-only/i);
assert.throws(() => parseSoftApiCallback({ ...sample, bet_amount: -1 }, { secret, encryptionMode: "optional" }), /bet_amount/i);
assert.throws(() => parseSoftApiCallback({ ...sample, timestamp: "not-a-time" }, { secret, encryptionMode: "optional" }), /timestamp/i);
assert.throws(() => parseSoftApiCallback({ payload: encrypted.payload, timestamp: "bad" }, { secret }), /wrapper timestamp/i);
assert.throws(() => parseSoftApiCallback(encrypted, { secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }), /padding|JSON|decrypt/i);
assert.throws(() => parseSoftApiCallback(encrypted, { secret, encryptionMode: "disabled" }), /encryption mode/i);

console.log("PASS: SoftAPI launch payload, key isolation, HTTPS guards, encrypted/plain callback validation, and idempotency tested.");
console.log("PASS: Tests used synthetic credentials and made no provider network request.");
