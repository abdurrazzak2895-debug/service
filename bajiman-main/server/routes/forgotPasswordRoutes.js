import express from "express";
import axios from "axios";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { getOrCreateOtpSetting } from "./otpSettingRoutes.js";

const router = express.Router();

const OTP_EXPIRE_MS = 3 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const forgotOtpStore = new Map();
const registerOtpStore = new Map();

// Admin manages the SMS api key + per-flow on/off toggles from the admin
// panel now, instead of only a fixed env var. The env var is kept as a
// fallback so nothing breaks before an admin sets a key via the UI.
const getApiKey = (setting) =>
  (setting?.apiKey || "").trim() || process.env.OTP_API_KEY || "";

const clean = (value = "") => String(value || "").trim();

const normalizeCountryCode = (code = "") => {
  const value = clean(code);
  if (!value) return "";
  return value.startsWith("+") ? value : `+${value.replace(/\D/g, "")}`;
};

const onlyDigits = (value = "") => String(value || "").replace(/\D/g, "");

const normalizeLocalPhone = (countryCode, phone) => {
  let cleanPhone = onlyDigits(phone);

  if (countryCode === "+880" && cleanPhone && !cleanPhone.startsWith("0")) {
    cleanPhone = `0${cleanPhone}`;
  }

  return cleanPhone;
};

const getOtpKey = (countryCode, phone) => {
  const cc = normalizeCountryCode(countryCode);
  const ph = normalizeLocalPhone(cc, phone);
  return `${cc}:${ph}`;
};

const buildSmsPhoneNumber = (countryCode, phone) => {
  const cc = normalizeCountryCode(countryCode);
  let ph = normalizeLocalPhone(cc, phone);

  if (cc === "+880" && ph.startsWith("0")) {
    ph = ph.slice(1);
  }

  return `${cc.replace("+", "")}${ph}`;
};

export const isRegisterOtpVerified = ({ countryCode, phone, otp }) => {
  const cc = normalizeCountryCode(countryCode);

  if (cc !== "+880") return true;

  const key = getOtpKey(cc, phone);
  const savedOtp = registerOtpStore.get(key);

  if (!savedOtp) return false;
  if (Date.now() > savedOtp.expiresAt) {
    registerOtpStore.delete(key);
    return false;
  }

  return (
    savedOtp.verified === true &&
    String(savedOtp.otp) === String(otp || "").trim()
  );
};

export const clearRegisterOtp = ({ countryCode, phone }) => {
  registerOtpStore.delete(getOtpKey(countryCode, phone));
};

/* Register OTP */
router.post("/register/send-otp", async (req, res) => {
  try {
    const cc = normalizeCountryCode(req.body.countryCode);
    const phone = normalizeLocalPhone(cc, req.body.phone);

    if (!cc || !phone) {
      return res.status(400).json({
        success: false,
        message: "Country code and phone are required",
      });
    }

    if (cc !== "+880") {
      return res.status(400).json({
        success: false,
        message: "OTP is only required for Bangladesh numbers",
      });
    }

    const exists = await User.exists({ countryCode: cc, phone });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered",
      });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (!otpSetting.registerEnabled) {
      return res.status(400).json({
        success: false,
        message: "OTP is disabled for registration",
      });
    }

    const apiKey = getApiKey(otpSetting);

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "OTP API key is missing" });
    }

    const key = getOtpKey(cc, phone);
    const oldOtp = registerOtpStore.get(key);

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
      { phoneNumber: buildSmsPhoneNumber(cc, phone) },
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

    registerOtpStore.set(key, {
      otp: String(data.otp).trim(),
      expiresAt: Date.now() + OTP_EXPIRE_MS,
      lastSentAt: Date.now(),
      verified: false,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      resendAfter: 60,
    });
  } catch (error) {
    console.error("REGISTER SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP",
    });
  }
});

router.post("/register/verify-otp", async (req, res) => {
  try {
    const cc = normalizeCountryCode(req.body.countryCode);
    const phone = normalizeLocalPhone(cc, req.body.phone);
    const otp = clean(req.body.otp);

    if (!cc || !phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Country code, phone and OTP are required",
      });
    }

    const key = getOtpKey(cc, phone);
    const savedOtp = registerOtpStore.get(key);

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please send OTP again",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      registerOtpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please send OTP again",
      });
    }

    if (String(savedOtp.otp) !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    registerOtpStore.set(key, { ...savedOtp, verified: true });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("REGISTER VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "OTP verification failed",
    });
  }
});

/* Forgot Password OTP */
router.post("/send-otp", async (req, res) => {
  try {
    const cc = normalizeCountryCode(req.body.countryCode);
    const phone = normalizeLocalPhone(cc, req.body.phone);

    if (!cc || !phone) {
      return res.status(400).json({
        success: false,
        message: "Country code and phone are required",
      });
    }

    if (cc !== "+880") {
      return res.status(400).json({
        success: false,
        message: "OTP is only required for Bangladesh numbers",
      });
    }

    const user = await User.findOne({ countryCode: cc, phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number",
      });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (!otpSetting.forgotPasswordEnabled) {
      return res.status(400).json({
        success: false,
        message: "OTP is disabled for forgot password",
      });
    }

    const apiKey = getApiKey(otpSetting);

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "OTP API key is missing" });
    }

    const key = getOtpKey(cc, phone);
    const oldOtp = forgotOtpStore.get(key);

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
      { phoneNumber: buildSmsPhoneNumber(cc, phone) },
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

    forgotOtpStore.set(key, {
      otp: String(data.otp).trim(),
      expiresAt: Date.now() + OTP_EXPIRE_MS,
      lastSentAt: Date.now(),
      verified: false,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      resendAfter: 60,
    });
  } catch (error) {
    console.error("FORGOT SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const cc = normalizeCountryCode(req.body.countryCode);
    const phone = normalizeLocalPhone(cc, req.body.phone);
    const otp = clean(req.body.otp);

    if (!cc || !phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Country code, phone and OTP are required",
      });
    }

    const key = getOtpKey(cc, phone);
    const savedOtp = forgotOtpStore.get(key);

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please send OTP again",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      forgotOtpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please send OTP again",
      });
    }

    if (String(savedOtp.otp) !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    forgotOtpStore.set(key, { ...savedOtp, verified: true });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("FORGOT VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "OTP verification failed",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const cc = normalizeCountryCode(req.body.countryCode);
    const phone = normalizeLocalPhone(cc, req.body.phone);
    const otp = clean(req.body.otp);
    const { password, confirmPassword } = req.body;

    if (!cc || !phone) {
      return res.status(400).json({
        success: false,
        message: "Country code and phone are required",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (String(password).length < 6 || String(password).length > 20) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be 6-20 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (cc === "+880" && otpSetting.forgotPasswordEnabled) {
      const key = getOtpKey(cc, phone);
      const savedOtp = forgotOtpStore.get(key);

      if (!savedOtp) {
        return res.status(400).json({
          success: false,
          message: "OTP not found. Please send OTP again",
        });
      }

      if (Date.now() > savedOtp.expiresAt) {
        forgotOtpStore.delete(key);
        return res.status(400).json({
          success: false,
          message: "OTP expired. Please send OTP again",
        });
      }

      if (!savedOtp.verified) {
        return res
          .status(400)
          .json({ success: false, message: "Please verify OTP first" });
      }

      if (String(savedOtp.otp) !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
    }

    const user = await User.findOne({ countryCode: cc, phone });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(String(password), 10);
    await user.save();

    forgotOtpStore.delete(getOtpKey(cc, phone));

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Password reset failed",
    });
  }
});

export default router;
