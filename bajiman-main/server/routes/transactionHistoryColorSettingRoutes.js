import express from "express";
import TransactionHistoryColorSetting from "../models/TransactionHistoryColorSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "modalBg",
  "pageOverlayBg",

  "headerBg",
  "headerText",
  "closeIconColor",

  "primaryBg",
  "primaryText",

  "secondaryBg",
  "secondaryText",

  "inactiveTabBg",
  "inactiveTabText",

  "sectionBg",
  "sectionBorder",
  "sectionText",

  "cardBg",
  "cardBorder",

  "inputBg",
  "inputText",
  "inputBorder",
  "inputFocusBorder",

  "labelText",
  "normalText",
  "mutedText",

  "summaryBg",
  "summaryText",

  "progressBg",
  "progressTrackBg",

  "successBg",
  "successText",

  "warningBg",
  "warningText",

  "dangerBg",
  "dangerText",

  "disabledBg",
  "disabledText",
];

const getOrCreateSetting = async () => {
  let setting = await TransactionHistoryColorSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) {
    setting = await TransactionHistoryColorSetting.create({});
  }

  return setting;
};

/* GET /api/transaction-history-color-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Transaction history color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/transaction-history-color-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await TransactionHistoryColorSetting.findOne({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Transaction history color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/transaction-history-color-settings */
router.put("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    allowedFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = clean(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Transaction history color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/transaction-history-color-settings/reset */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await TransactionHistoryColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await TransactionHistoryColorSetting.create({});

    return successResponse(
      res,
      "Transaction history color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
