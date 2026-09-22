import express from "express";
import HomePageContentColorSetting from "../models/HomePageContentColorSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "pageBg",

  "sectionBg",
  "sectionTitleText",
  "sectionBarBg",

  "cardBg",
  "cardBorder",
  "cardText",
  "cardHoverShadow",

  "imageBoxBg",
  "imagePlaceholderText",

  "skeletonBg",

  "buttonBg",
  "buttonText",
  "inactiveButtonBg",
  "inactiveButtonText",

  "inputBg",
  "inputText",
  "inputBorder",
  "inputFocusBorder",

  "emptyText",

  "paginationBg",
  "paginationText",
  "paginationDisabledOpacity",

  "accountOverlayBg",
  "accountModalBg",
  "accountHeaderBg",
  "accountHeaderText",
  "accountHeaderCardBg",

  "accountAvatarBg",
  "accountAvatarText",
  "accountMutedText",

  "accountBalanceBg",
  "accountBalanceBorder",
  "accountBalanceText",
  "accountBalanceMutedText",

  "accountPrimaryButtonBg",
  "accountPrimaryButtonText",
  "accountDangerButtonBg",
  "accountDangerButtonText",

  "accountSectionBg",
  "accountSectionBorder",
  "accountSectionHeaderBg",
  "accountSectionTitleText",
  "accountSectionBarBg",

  "accountIconBoxBg",
  "accountIconBoxText",
  "accountMenuText",
  "accountMenuHoverBg",

  "accountLogoutBg",
  "accountLogoutText",

  "accountLoadingBg",
  "accountLoadingText",
];

const getOrCreateSetting = async () => {
  let setting = await HomePageContentColorSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) {
    setting = await HomePageContentColorSetting.create({});
  }

  return setting;
};

/* GET /api/home-page-content-color-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Home page content color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/home-page-content-color-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await HomePageContentColorSetting.findOne({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Home page content color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/home-page-content-color-settings */
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
      "Home page content color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/home-page-content-color-settings/reset */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await HomePageContentColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await HomePageContentColorSetting.create({});

    return successResponse(
      res,
      "Home page content color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
