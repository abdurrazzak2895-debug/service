import express from "express";
import OtpSetting from "../models/OtpSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

// Atomic find-or-create: this is called from several route files
// concurrently (register, forgot-password, e-wallet, plus this file's own
// GET/PUT/DELETE). A plain findOne-then-create has a race window where two
// concurrent first calls can each create their own doc, leaving two
// singletons that different requests inconsistently read/write — which is
// exactly what made the admin toggles look like they weren't saving.
// findOneAndUpdate + upsert avoids that race entirely.
export const getOrCreateOtpSetting = async () => {
  return OtpSetting.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );
};

/* ADMIN: get full setting (including the api key) */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateOtpSetting();
    return successResponse(res, "OTP setting loaded", setting);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: add/update the api key and per-flow toggles */
router.put("/", protectAdmin, async (req, res) => {
  try {
    const { apiKey, registerEnabled, forgotPasswordEnabled, withdrawEnabled } =
      req.body || {};

    const setting = await getOrCreateOtpSetting();

    if (apiKey !== undefined) setting.apiKey = String(apiKey || "").trim();
    if (registerEnabled !== undefined)
      setting.registerEnabled = Boolean(registerEnabled);
    if (forgotPasswordEnabled !== undefined)
      setting.forgotPasswordEnabled = Boolean(forgotPasswordEnabled);
    if (withdrawEnabled !== undefined)
      setting.withdrawEnabled = Boolean(withdrawEnabled);

    await setting.save();

    return successResponse(res, "OTP setting updated", setting);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: clear just the api key */
router.delete("/api-key", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateOtpSetting();
    setting.apiKey = "";
    await setting.save();

    return successResponse(res, "API key removed", setting);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUBLIC: which flows currently require OTP (never exposes the api key) */
router.get("/public", async (req, res) => {
  try {
    const setting = await getOrCreateOtpSetting();

    return successResponse(res, "OTP setting loaded", {
      registerEnabled: setting.registerEnabled,
      forgotPasswordEnabled: setting.forgotPasswordEnabled,
      withdrawEnabled: setting.withdrawEnabled,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
