#!/usr/bin/env node

import "dotenv/config";
import { postTransfer } from "../services/nineWicketService.js";

const userId = String(process.env.LIVE_TEST_USER_ID || "1001");
const gameUid = String(process.env.NINEWICKET_GAME_UID || "11539");
const balance = Number(process.env.LIVE_TEST_BALANCE || "0");
const callback = String(process.env.NINEWICKET_CALLBACK_URL || "https://bajiman-server.vercel.app/api/9wicket/callback");
const returnUrl = String(process.env.NINEWICKET_RETURN_URL || "https://bajiman-client-one.vercel.app/");
const currency = String(process.env.NINEWICKET_CURRENCY || "BDT").toUpperCase();

if (!Number.isFinite(balance) || balance < 0) throw new Error("LIVE_TEST_BALANCE must be non-negative");
if (!/^https:\/\//i.test(callback) || !/^https:\/\//i.test(returnUrl)) {
  throw new Error("Callback and return URLs must use HTTPS");
}

const safeUrl = (value) => typeof value === "string" ? (() => {
  try {
    const u = new URL(value);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "[returned-url-invalid-or-redacted]";
  }
})() : null;

try {
  const result = await postTransfer({
    user_id: Number(userId) || userId,
    balance,
    game_uid: gameUid,
    symbol: process.env.NINEWICKET_SYMBOL || "9W",
    currency_code: currency,
    language: process.env.NINEWICKET_LANGUAGE || "en",
    callback,
    return: returnUrl,
    transfer_id: `live-smoke-${userId}-${Date.now()}`,
  });

  const data = result?.data && typeof result.data === "object" ? result.data : {};
  console.log(JSON.stringify({
    ok: Number(result?.code) === 0,
    providerCode: result?.code ?? null,
    providerMessage: result?.msg ?? null,
    testUserId: userId,
    gameUid,
    balance,
    currencyCode: currency,
    returnedDataKeys: Object.keys(data),
    returnedGameUrl: safeUrl(data.url),
    note: "A live launch request was sent; no token or full session URL is printed.",
  }));
} catch (error) {
  const provider = error?.providerResponse || {};
  const providerData = provider.data && typeof provider.data === "object" ? provider.data : {};
  console.log(JSON.stringify({
    ok: false,
    providerCode: provider.code ?? null,
    providerMessage: provider.msg || error.message,
    testUserId: userId,
    gameUid,
    balance,
    currencyCode: currency,
    returnedDataKeys: Object.keys(providerData),
    returnedGameUrl: safeUrl(providerData.url),
    note: "The live launch request reached the provider but was rejected; no token or full URL is printed.",
  }));
  process.exitCode = 1;
}
