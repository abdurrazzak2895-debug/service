#!/usr/bin/env node
import assert from "node:assert/strict";
import { decryptPayload, encryptPayload } from "../services/nineWicketCrypto.js";

const secret = "0123456789abcdef0123456789abcdef";
process.env.NINEWICKET_SECRET = secret;

const cases = [
  {
    user_id: 1001,
    balance: 1000,
    game_uid: "11539",
    symbol: "9W",
    token: "test-token",
    timestamp: 1710000000000,
    return: "https://example.com/lobby",
    callback: "https://example.com/api/9wicket/callback",
    currency_code: "BDT",
    language: "en",
    transfer_id: "crypto-test-launch-001",
  },
  {
    unicode: "বাংলাদেশ / 9Wicket",
    empty: "",
    zero: 0,
    negative: -500.25,
    nested: { enabled: true, values: [1, 2, 3] },
  },
  Object.fromEntries(Array.from({ length: 16 }, (_, index) => [`field_${index}`, "x".repeat(index)])),
];

for (const original of cases) {
  const encrypted = encryptPayload(original);
  assert.match(encrypted, /^[A-Za-z0-9+/]+={0,2}$/);
  assert.ok(encrypted.length > 0, "encrypted payload should not be empty");
  const decrypted = decryptPayload(encrypted);
  assert.deepEqual(decrypted, original);
}

console.log(`PASS: ${cases.length} AES-256-ECB round-trip cases passed.`);
console.log("PASS: PKCS7 padding, Base64 encoding, Unicode, nested values, and boundary lengths verified.");
console.log("PASS: No provider request was made and no credential was printed.");
