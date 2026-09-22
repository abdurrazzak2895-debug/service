import express from "express";
import ModalColorSetting from "../models/ModalColorSetting.js";
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
  "primaryHoverBg",

  "secondaryBg",
  "secondaryText",

  "inactiveTabBg",
  "inactiveTabText",

  "promotionBg",
  "promotionText",

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

  "disabledBg",
  "disabledText",

  "dangerBg",
  "dangerText",

  "successBg",
  "successText",
];

const getOrCreateSetting = async () => {
  let setting = await ModalColorSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await ModalColorSetting.create({});
  }

  return setting;
};

/* GET /api/modal-color-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Modal color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/modal-color-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await ModalColorSetting.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Modal color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/modal-color-settings */
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
      "Modal color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/modal-color-settings/reset */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await ModalColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await ModalColorSetting.create({});

    return successResponse(
      res,
      "Modal color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
