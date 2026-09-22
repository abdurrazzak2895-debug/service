import express from "express";
import NavbarColorSetting from "../models/NavbarColorSetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const allowedFields = [
  "headerBg",
  "headerShadow",

  "signupBg",
  "signupText",
  "signupHoverBg",

  "loginBg",
  "loginText",
  "loginHoverBg",

  "depositBg",
  "depositText",
  "depositHoverBg",

  "walletBg",
  "walletText",
  "walletHoverBg",

  "profileIconBg",
  "profileIconColor",

  "dropdownBg",
  "dropdownText",
  "dropdownHoverBg",
  "dropdownIconBg",
  "dropdownIconText",

  "logoutText",
  "logoutIconBg",
  "logoutHoverBg",

  "languageModalHeaderBg",
  "languageModalHeaderText",
  "languageActiveBg",
  "languageActiveText",
  "languageInactiveBg",
  "languageInactiveText",

  "mobileMenuIconColor",
];

const getOrCreateSetting = async () => {
  let setting = await NavbarColorSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await NavbarColorSetting.create({});
  }

  return setting;
};

/* ======================================================
   GET NAVBAR COLOR SETTING - ADMIN
   GET /api/navbar-color-settings
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Navbar color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE NAVBAR COLOR SETTING - PUBLIC
   GET /api/navbar-color-settings/public/active
====================================================== */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await NavbarColorSetting.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Navbar color setting fetched successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE NAVBAR COLOR SETTING
   PUT /api/navbar-color-settings
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
      "Navbar color setting updated successfully",
      setting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET NAVBAR COLOR SETTING
   PATCH /api/navbar-color-settings/reset
====================================================== */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    await NavbarColorSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await NavbarColorSetting.create({});

    return successResponse(
      res,
      "Navbar color setting reset successfully",
      newSetting,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
