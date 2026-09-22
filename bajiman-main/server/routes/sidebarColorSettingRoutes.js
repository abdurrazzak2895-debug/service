import express from "express";

import SidebarColorSetting from "../models/SidebarColorSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "desktopBg",
  "desktopToggleBg",
  "desktopToggleText",
  "desktopToggleHoverBg",

  "desktopItemHoverBg",
  "desktopItemActiveBg",
  "desktopItemActiveBorder",

  "desktopIconBg",
  "desktopIconText",
  "desktopActiveIconBg",
  "desktopActiveIconText",

  "desktopExpandedText",
  "desktopExpandedIconBg",
  "desktopExpandedActiveBg",

  "desktopChildBg",
  "desktopChildText",
  "desktopChildHoverBg",
  "desktopChildBorder",

  "mobileBg",
  "mobileText",
  "mobileItemHoverBg",
  "mobileItemActiveBg",
  "mobileItemActiveText",
  "mobileIconText",

  "mobileSectionText",
  "mobileSectionBorder",

  "mobilePanelBg",
  "mobilePanelBorder",
  "mobilePanelText",
  "mobilePanelHoverBg",

  "overlayBg",
];

const getOrCreateSetting = async () => {
  let setting = await SidebarColorSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await SidebarColorSetting.create({});
  }

  return setting;
};

/* ======================================================
   GET SIDEBAR COLOR SETTING - ADMIN
   GET /api/sidebar-color-settings
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Sidebar color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE SIDEBAR COLOR SETTING - PUBLIC
   GET /api/sidebar-color-settings/public/active
====================================================== */

router.get("/public/active", async (req, res) => {
  try {
    const setting = await SidebarColorSetting.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Sidebar color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE SIDEBAR COLOR SETTING
   PUT /api/sidebar-color-settings
====================================================== */

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
      "Sidebar color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET SIDEBAR COLOR SETTING
   PATCH /api/sidebar-color-settings/reset
====================================================== */

router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await SidebarColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await SidebarColorSetting.create({});

    return successResponse(
      res,
      "Sidebar color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
