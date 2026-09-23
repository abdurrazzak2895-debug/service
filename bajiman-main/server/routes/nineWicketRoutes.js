import express from "express";
import crypto from "node:crypto";
import User from "../models/User.js";
import NineWicketSession from "../models/NineWicketSession.js";
import protectUser from "../middleware/protectUser.js";
import { decryptPayload, getTransactions, postTransfer } from "../services/nineWicketService.js";

const router = express.Router();
const configuredGameUid = () => String(process.env.NINEWICKET_GAME_UID || "11539").trim();
const symbol = () => String(process.env.NINEWICKET_SYMBOL || "9W").trim();
const callbackUrl = () => String(process.env.NINEWICKET_CALLBACK_URL || "").trim();
const returnUrl = () => String(process.env.NINEWICKET_RETURN_URL || "").trim();
const currency = () => String(process.env.NINEWICKET_CURRENCY || "BDT").trim().toUpperCase();
const language = () => String(process.env.NINEWICKET_LANGUAGE || "en").trim();
const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const transferId = (prefix, userId) => `${prefix}-${userId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

const validateUrls = () => {
  if (!/^https:\/\//i.test(callbackUrl())) throw new Error("NINEWICKET_CALLBACK_URL must be an HTTPS URL");
  if (!/^https:\/\//i.test(returnUrl()) || returnUrl().includes("?")) {
    throw new Error("NINEWICKET_RETURN_URL must be an HTTPS URL without a query string");
  }
};

const numericUserId = (user) => {
  const digits = String(user.userId || "").replace(/\D/g, "");
  if (digits) return Number(digits.slice(-9));
  return parseInt(String(user._id).replace(/\D/g, "").slice(-9), 10) || 1;
};

// Existing local demo cards can contain Mongo IDs or slugs. In those cases,
// use the configured 9Wicket game UID instead of sending an invalid provider UID.
const resolveProviderGameUid = (value) => {
  const requested = String(value || "").trim();
  if (!requested) return configuredGameUid();
  if (/^[a-f0-9]{24}$/i.test(requested)) return configuredGameUid();
  if (/^(sports|casino|slot|fishing|hot|football|cricket)-/i.test(requested)) return configuredGameUid();
  return requested;
};

const plainFor = ({ user, balance, transferId: id, gameUid: providerGameUid = configuredGameUid() }) => ({
  user_id: numericUserId(user),
  balance: money(balance),
  game_uid: String(providerGameUid),
  symbol: symbol(),
  timestamp: Date.now(),
  return: returnUrl(),
  callback: callbackUrl(),
  currency_code: currency(),
  language: language(),
  transfer_id: id,
});

export const launchNineWicket = async (req, res) => {
  let reserved = 0;
  let session;
  try {
    validateUrls();
    const requestedGameUid = req.body?.game_uid || req.body?.gameID || req.body?.gameId;
    const providerGameUid = resolveProviderGameUid(requestedGameUid);
    const user = await User.findById(req.user.id).select("userId balance currency isActive");
    if (!user || user.isActive !== true) return res.status(403).json({ success: false, message: "User is not active" });

    const amount = money(req.body?.amount ?? user.balance);
    // 9Wicket documents balance=0 as inquiry + launch/re-open. This allows
    // a user with an existing provider wallet to reopen it without a new
    // local-wallet deposit.
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: "Launch amount cannot be negative" });
    }

    const id = transferId("9w-launch", numericUserId(user));
    const updated = amount === 0
      ? user
      : await User.findOneAndUpdate(
          { _id: user._id, balance: { $gte: amount }, isActive: true },
          { $inc: { balance: -amount } },
          { new: true },
        );
    if (!updated) return res.status(400).json({ success: false, message: "Insufficient balance" });
    reserved = amount;

    session = await NineWicketSession.create({
      user: user._id,
      userId: numericUserId(user),
      gameUid: providerGameUid,
      symbol: symbol(),
      launchTransferId: id,
      launchAmount: amount,
      status: "launching",
    });

    const result = await postTransfer(plainFor({
      user,
      balance: amount,
      transferId: id,
      gameUid: providerGameUid,
    }));
    const providerSessionId = Number(result?.data?.session_id || 0) || null;
    await NineWicketSession.findByIdAndUpdate(session._id, {
      $set: {
        sessionId: providerSessionId,
        lastProviderBalance: money(result?.data?.after_amount || amount),
        status: "active",
        startedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      gameUrl: result.data.url,
      launch_url: result.data.url,
      data: { ...result.data, game_uid: providerGameUid },
      sessionId: providerSessionId,
      provider: "9wicket",
    });
  } catch (error) {
    if (reserved) await User.findByIdAndUpdate(req.user.id, { $inc: { balance: reserved } });
    if (session?._id) await NineWicketSession.findByIdAndUpdate(session._id, { $set: { status: "failed", lastError: error.message } });
    return res.status(error.response?.status || 502).json({ success: false, message: error.message, provider: error.providerResponse || null });
  }
};

router.post("/launch", protectUser, launchNineWicket);

router.post("/inquiry", protectUser, async (req, res) => {
  try {
    validateUrls();
    const user = await User.findById(req.user.id).select("userId isActive");
    if (!user || user.isActive !== true) return res.status(403).json({ success: false, message: "User is not active" });
    const result = await postTransfer(plainFor({ user, balance: 0, transferId: transferId("9w-inquiry", numericUserId(user)) }));
    await NineWicketSession.findOneAndUpdate(
      { user: user._id, status: { $in: ["active", "cashout_pending"] } },
      { $set: { lastProviderBalance: money(result?.data?.after_amount || 0) } },
      { sort: { createdAt: -1 } },
    );
    return res.json({ success: true, data: result.data, provider: "9wicket" });
  } catch (error) {
    return res.status(502).json({ success: false, message: error.message, provider: error.providerResponse || null });
  }
});

router.post("/cashout", protectUser, async (req, res) => {
  try {
    validateUrls();
    const user = await User.findById(req.user.id).select("userId balance isActive");
    if (!user || user.isActive !== true) return res.status(403).json({ success: false, message: "User is not active" });
    const session = await NineWicketSession.findOneAndUpdate(
      { user: user._id, status: "active" },
      { $set: { status: "cashout_pending" } },
      { sort: { createdAt: -1 }, new: true },
    );
    if (!session) return res.status(404).json({ success: false, message: "No active 9Wicket session" });
    const inquiry = await postTransfer(plainFor({ user, balance: 0, transferId: transferId("9w-inquiry", numericUserId(user)), gameUid: session.gameUid }));
    const remaining = money(inquiry?.data?.after_amount || 0);
    if (remaining <= 0) {
      await NineWicketSession.findByIdAndUpdate(session._id, { $set: { status: "cashed_out", lastProviderBalance: 0, cashedOutAt: new Date(), endedAt: new Date() } });
      return res.json({ success: true, data: { remaining: 0, credited: 0 }, provider: "9wicket" });
    }
    const result = await postTransfer(plainFor({ user, balance: -remaining, transferId: transferId("9w-cashout", numericUserId(user)), gameUid: session.gameUid }));
    await User.findByIdAndUpdate(user._id, { $inc: { balance: remaining } });
    await NineWicketSession.findByIdAndUpdate(session._id, { $set: { status: "cashed_out", lastProviderBalance: money(result?.data?.after_amount || 0), cashedOutAt: new Date(), endedAt: new Date() } });
    return res.json({ success: true, data: { ...result.data, credited: remaining }, provider: "9wicket" });
  } catch (error) {
    await NineWicketSession.findOneAndUpdate({ user: req.user.id, status: "cashout_pending" }, { $set: { status: "active", lastError: error.message } }, { sort: { createdAt: -1 } });
    return res.status(502).json({ success: false, message: error.message, provider: error.providerResponse || null });
  }
});

router.get("/transactions", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("userId");
    const data = await getTransactions("/9w/transactions", { user_id: numericUserId(user), from: req.query.from, to: req.query.to, status: req.query.status, page: req.query.page, page_size: req.query.page_size });
    return res.json({ success: true, data, provider: "9wicket" });
  } catch (error) { return res.status(502).json({ success: false, message: error.message, provider: error.providerResponse || null }); }
});

router.get("/session-transactions", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("userId");
    const params = req.query.session_id ? { session_id: req.query.session_id } : { user_id: numericUserId(user), launched_at: req.query.launched_at };
    const data = await getTransactions("/9w/session-transactions", params);
    return res.json({ success: true, data, provider: "9wicket" });
  } catch (error) { return res.status(502).json({ success: false, message: error.message, provider: error.providerResponse || null }); }
});

router.post("/callback", async (req, res) => {
  try {
    const event = req.body?.payload ? decryptPayload(req.body.payload) : req.body || {};
    const sessionId = Number(event.session_id || 0);
    const update = {
      $set: { lastProviderBalance: money(event.after_amount || 0), ...(event.event === "session_end" ? { status: "ended", endedAt: new Date() } : {}) },
      $push: { callbackEvents: { $each: [event], $slice: -20 } },
    };
    if (sessionId) await NineWicketSession.findOneAndUpdate({ sessionId }, update);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("9Wicket callback error:", error.message);
    return res.status(200).send("OK");
  }
});

export default router;
