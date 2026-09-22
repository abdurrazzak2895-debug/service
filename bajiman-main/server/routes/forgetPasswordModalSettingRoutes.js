import express from "express";
import fs from "fs";
import path from "path";

import ForgetPasswordModalSetting from "../models/ForgetPasswordModalSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const colorFields = [
  "overlayBg",
  "modalBg",
  "headerBg",
  "headerText",

  "labelText",
  "inputBg",
  "inputText",
  "inputBorder",
  "placeholderText",

  "iconText",

  "buttonBg",
  "buttonText",
  "buttonDisabledBg",

  "secondaryButtonBg",
  "secondaryButtonText",
  "secondaryButtonBorder",

  "linkText",
  "footerText",

  "dropdownBg",
  "dropdownText",
  "dropdownBorder",
  "dropdownHoverBg",
];

const getOrCreateSetting = async () => {
  let setting = await ForgetPasswordModalSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) {
    setting = await ForgetPasswordModalSetting.create({});
  }

  return setting;
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (oldPath = "") => {
  try {
    if (!oldPath) return;
    if (String(oldPath).startsWith("http")) return;

    const fullPath = path.resolve(oldPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FORGET PASSWORD MODAL FILE DELETE ERROR:", error.message);
  }
};

const formatSetting = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
  };
};

/* ======================================================
   GET FORGET PASSWORD MODAL SETTING - ADMIN
   GET /api/forget-password-modal-settings
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Forget password modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE FORGET PASSWORD MODAL SETTING - PUBLIC
   GET /api/forget-password-modal-settings/public/active
====================================================== */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await ForgetPasswordModalSetting.findOne({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Forget password modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE FORGET PASSWORD MODAL SETTING
   PUT /api/forget-password-modal-settings
====================================================== */
router.put("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = clean(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    const oldLogo = setting.logo;

    if (req.file) {
      setting.logo = filePath(req.file);
    }

    if (String(req.body?.removeLogo) === "true") {
      setting.logo = "";
    }

    await setting.save();

    if (req.file && oldLogo) deleteLocalFile(oldLogo);

    if (String(req.body?.removeLogo) === "true" && oldLogo) {
      deleteLocalFile(oldLogo);
    }

    return successResponse(
      res,
      "Forget password modal setting updated successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE FORGET PASSWORD LOGO
   DELETE /api/forget-password-modal-settings/logo
====================================================== */
router.delete("/logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const oldLogo = setting.logo;
    setting.logo = "";

    await setting.save();

    if (oldLogo) deleteLocalFile(oldLogo);

    return successResponse(
      res,
      "Forget password modal logo removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET FORGET PASSWORD MODAL SETTING
   PATCH /api/forget-password-modal-settings/reset
====================================================== */
router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    if (oldSetting.logo) deleteLocalFile(oldSetting.logo);

    await ForgetPasswordModalSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await ForgetPasswordModalSetting.create({});

    return successResponse(
      res,
      "Forget password modal setting reset successfully",
      formatSetting(req, newSetting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
