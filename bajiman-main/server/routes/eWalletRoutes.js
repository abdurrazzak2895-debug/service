import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import EWallet from "../models/EWallet.js";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { getOrCreateOtpSetting } from "./otpSettingRoutes.js";

const router = express.Router();

const MANUAL_WALLET_CAP = 4;
const OTP_EXPIRE_MS = 3 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

// Keyed by userId (string) — this OTP always goes to the authenticated
// user's own registered phone, never an arbitrary number from the request
// body. Must be a string, not the raw ObjectId: protectUser re-derives
// req.user on every request, so the ObjectId is a *new object instance*
// each time even for the same user — and Map.get/set use reference
// equality for object keys, so an ObjectId key would never match across
// the send-otp and create-wallet requests. Shared with withdrawRequestRoutes.js
// (via the exported check/consume helpers below), since a withdraw
// confirmation is also just "OTP to my own registered phone".
const userOtpStore = new Map();

const getUserIdFromReq = (req) => {
  const id = req.user?.id || req.user?._id || null;
  return id ? String(id) : null;
};

const normalizeWalletType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeWalletNumber = (value) => String(value || "").trim();

const normalizeLabel = (value) => String(value || "").trim();

const clean = (value = "") => String(value || "").trim();

const validWalletTypes = ["personal", "agent", "merchant"];

const validateWalletNumber = (walletNumber) =>
  /^01[3-9]\d{8}$/.test(walletNumber);

const buildSmsPhoneNumber = (countryCode, phone) => {
  const cc = String(countryCode || "").trim();
  let ph = String(phone || "").trim();

  if (cc === "+880" && ph.startsWith("0")) {
    ph = ph.slice(1);
  }

  return `${cc.replace("+", "")}${ph}`;
};

const maskPhone = (phone = "") => {
  const value = String(phone || "");
  if (value.length <= 4) return value;
  return `${value.slice(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`;
};

const getApiKey = (setting) =>
  (setting?.apiKey || "").trim() || process.env.OTP_API_KEY || "";

// Every user gets exactly one auto e-wallet, tied to their registration
// phone number, that they can never edit or delete — it's always
// available for withdraw. Idempotent (upsert), so it's safe to call on
// every GET /api/e-wallets, including for users who registered before
// this feature existed.
const ensureRegistrationWallet = async (userId, user) => {
  if (!user?.phone) return null;

  try {
    return await EWallet.findOneAndUpdate(
      { user: userId, isAutoRegistration: true },
      {
        $setOnInsert: {
          user: userId,
          walletType: "personal",
          walletNumber: user.phone,
          label: "Registration Number",
          isAutoRegistration: true,
          isDefault: true,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  } catch (error) {
    // The registration number was already saved as a manual wallet before
    // this feature existed — the unique {user, walletNumber} index blocks
    // inserting a second doc for the same number, so promote that
    // existing one to the auto slot instead.
    if (error?.code === 11000) {
      return EWallet.findOneAndUpdate(
        { user: userId, walletNumber: user.phone },
        { $set: { isAutoRegistration: true, label: "Registration Number" } },
        { returnDocument: "after" },
      );
    }

    throw error;
  }
};

// Shared by the e-wallet-add flow and the withdraw-confirm flow — both are
// "verify the OTP sent to my own registered phone".
export const checkUserOtp = (userId, otp) => {
  const savedOtp = userOtpStore.get(userId);

  if (!savedOtp) {
    return { ok: false, message: "OTP not found. Please send OTP again" };
  }

  if (Date.now() > savedOtp.expiresAt) {
    userOtpStore.delete(userId);
    return { ok: false, message: "OTP expired. Please send OTP again" };
  }

  if (String(savedOtp.otp) !== String(otp || "").trim()) {
    return { ok: false, message: "Invalid OTP" };
  }

  return { ok: true };
};

export const consumeUserOtp = (userId) => {
  userOtpStore.delete(userId);
};

/* USER: send OTP to my own registered phone (used both when adding a new
   e-wallet number and when confirming a withdraw request) */
router.post("/send-otp", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (!otpSetting.withdrawEnabled) {
      return res.status(400).json({
        success: false,
        message: "OTP is disabled for withdraw",
      });
    }

    const user = await User.findById(userId);
    if (!user?.countryCode || !user?.phone) {
      return res.status(404).json({
        success: false,
        message: "Your account has no registered phone number",
      });
    }

    if (user.countryCode !== "+880") {
      return res.status(400).json({
        success: false,
        message: "OTP is only supported for Bangladesh numbers",
      });
    }

    const apiKey = getApiKey(otpSetting);

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "OTP API key is missing" });
    }

    const oldOtp = userOtpStore.get(userId);

    if (
      oldOtp?.lastSentAt &&
      Date.now() - oldOtp.lastSentAt < RESEND_COOLDOWN_MS
    ) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - oldOtp.lastSentAt)) / 1000,
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before sending OTP again`,
        waitSeconds,
      });
    }

    const { data } = await axios.post(
      "https://api.o-sms.com/api/service/send-otp",
      { phoneNumber: buildSmsPhoneNumber(user.countryCode, user.phone) },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!data?.success || !data?.otp) {
      return res
        .status(400)
        .json({ success: false, message: data?.message || "OTP send failed" });
    }

    userOtpStore.set(userId, {
      otp: String(data.otp).trim(),
      expiresAt: Date.now() + OTP_EXPIRE_MS,
      lastSentAt: Date.now(),
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      resendAfter: 60,
      maskedPhone: `${user.countryCode} ${maskPhone(user.phone)}`,
    });
  } catch (error) {
    console.error("EWALLET SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP",
    });
  }
});

/* USER: list my wallets (registration number + up to 4 manually-added, shared across every withdraw method) */
router.get("/", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("phone countryCode");
    await ensureRegistrationWallet(userId, user);

    const items = await EWallet.find({
      user: userId,
      isActive: true,
    }).sort({
      isAutoRegistration: -1,
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (e) {
    console.error("GET EWALLETS ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load wallets",
    });
  }
});

/* USER: create wallet (OTP-verified) */
router.post("/", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const walletType = normalizeWalletType(req.body?.walletType);
    const walletNumber = normalizeWalletNumber(req.body?.walletNumber);
    const label = normalizeLabel(req.body?.label);
    const otp = clean(req.body?.otp);

    if (!validWalletTypes.includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet type",
      });
    }

    if (!walletNumber) {
      return res.status(400).json({
        success: false,
        message: "walletNumber is required",
      });
    }

    if (!validateWalletNumber(walletNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet number",
      });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (otpSetting.withdrawEnabled) {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const result = checkUserOtp(userId, otp);

      if (!result.ok) {
        return res.status(400).json({ success: false, message: result.message });
      }
    }

    const count = await EWallet.countDocuments({
      user: userId,
      isActive: true,
      isAutoRegistration: { $ne: true },
    });

    if (count >= MANUAL_WALLET_CAP) {
      return res.status(400).json({
        success: false,
        message: `You can add maximum ${MANUAL_WALLET_CAP} numbers`,
      });
    }

    const exists = await EWallet.findOne({
      user: userId,
      walletNumber,
      isActive: true,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This wallet already exists",
      });
    }

    const created = await EWallet.create({
      user: userId,
      walletType,
      walletNumber,
      label,
      isDefault: count === 0,
    });

    if (otpSetting.withdrawEnabled) {
      consumeUserOtp(userId);
    }

    return res.status(201).json({
      success: true,
      message: "E-wallet created successfully",
      data: created,
    });
  } catch (e) {
    console.error("CREATE EWALLET ERROR:", e);

    if (e?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This wallet already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: e?.message || "Failed to create wallet",
    });
  }
});

/* USER: update wallet (the auto registration wallet can't be edited) */
router.put("/:id", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (existing.isAutoRegistration) {
      return res.status(400).json({
        success: false,
        message: "Registration number cannot be edited",
      });
    }

    const walletType = normalizeWalletType(
      req.body?.walletType || existing.walletType,
    );
    const walletNumber = normalizeWalletNumber(
      req.body?.walletNumber || existing.walletNumber,
    );
    const label = normalizeLabel(
      req.body?.label !== undefined ? req.body.label : existing.label,
    );

    if (!validWalletTypes.includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet type",
      });
    }

    if (!walletNumber) {
      return res.status(400).json({
        success: false,
        message: "walletNumber is required",
      });
    }

    if (!validateWalletNumber(walletNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet number",
      });
    }

    const duplicate = await EWallet.findOne({
      user: userId,
      walletNumber,
      isActive: true,
      _id: { $ne: existing._id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another wallet already uses this number",
      });
    }

    existing.walletType = walletType;
    existing.walletNumber = walletNumber;
    existing.label = label;

    await existing.save();

    return res.json({
      success: true,
      message: "E-wallet updated successfully",
      data: existing,
    });
  } catch (e) {
    console.error("UPDATE EWALLET ERROR:", e);

    if (e?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another wallet already uses this number",
      });
    }

    return res.status(500).json({
      success: false,
      message: e?.message || "Failed to update wallet",
    });
  }
});

/* USER: soft delete wallet (the auto registration wallet can't be deleted) */
router.delete("/:id", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (existing.isAutoRegistration) {
      return res.status(400).json({
        success: false,
        message: "Registration number cannot be deleted",
      });
    }

    existing.isActive = false;
    existing.isDefault = false;
    await existing.save();

    const nextDefault = await EWallet.findOne({
      user: userId,
      isActive: true,
    }).sort({ isAutoRegistration: -1, createdAt: -1 });

    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }

    return res.json({
      success: true,
      message: "E-wallet deleted successfully",
    });
  } catch (e) {
    console.error("DELETE EWALLET ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to delete wallet",
    });
  }
});

/* USER: set default wallet */
router.patch("/:id/default", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    await EWallet.updateMany(
      { user: userId },
      { $set: { isDefault: false } },
    );

    existing.isDefault = true;
    await existing.save();

    return res.json({
      success: true,
      message: "Default wallet updated successfully",
      data: existing,
    });
  } catch (e) {
    console.error("SET DEFAULT EWALLET ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to set default wallet",
    });
  }
});

export default router;
