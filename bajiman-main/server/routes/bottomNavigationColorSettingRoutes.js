import express from "express";
import BottomNavigationColorSetting from "../models/BottomNavigationColorSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "beforeLoginBg",
  "beforeLoginBorder",

  "languageBoxBg",
  "languageTitleText",
  "languageSubtitleText",

  "signupBg",
  "signupText",

  "loginBg",
  "loginText",

  "afterLoginBgFrom",
  "afterLoginBgVia",
  "afterLoginBgTo",
  "afterLoginBorder",

  "itemIconBg",
  "itemIconText",
  "itemText",

  "activeIconBg",
  "activeIconText",
  "activeText",

  "depositIconBgFrom",
  "depositIconBgTo",
  "depositIconText",
  "depositBadgeBg",
  "depositBadgeText",

  "balanceBgFrom",
  "balanceBgVia",
  "balanceBgTo",
  "balanceText",
  "balanceMutedText",
  "balanceIconBg",
  "balanceActionBg",
  "balanceActionText",
  "balanceAccentIcon",
  "balanceDivider",

  "langModalOverlayBg",
  "langModalBg",
  "langModalHeaderBg",
  "langModalHeaderText",
  "langModalMutedText",

  "langOptionWrapperBg",
  "langOptionBg",
  "langOptionText",
  "langOptionActiveBg",
  "langOptionActiveText",
  "langOptionCheckBg",
  "langOptionCheckText",
  "langOptionCheckBorder",
];

const getOrCreateSetting = async () => {
  let setting = await BottomNavigationColorSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) {
    setting = await BottomNavigationColorSetting.create({});
  }

  return setting;
};

/* GET /api/bottom-navigation-color-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Bottom navigation color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/bottom-navigation-color-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await BottomNavigationColorSetting.findOne({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Bottom navigation color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/bottom-navigation-color-settings */
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
      "Bottom navigation color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/bottom-navigation-color-settings/reset */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await BottomNavigationColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await BottomNavigationColorSetting.create({});

    return successResponse(
      res,
      "Bottom navigation color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
