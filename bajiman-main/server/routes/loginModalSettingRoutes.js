import express from "express";
import fs from "fs";
import path from "path";

import LoginModalSetting from "../models/LoginModalSetting.js";
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
  "inputFocusBorder",
  "placeholderText",
  "iconText",
  "buttonBg",
  "buttonText",
  "buttonDisabledBg",
  "linkText",
  "footerText",
];

const getOrCreateSetting = async () => {
  let setting = await LoginModalSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await LoginModalSetting.create({});
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
    console.log("LOGIN MODAL FILE DELETE ERROR:", error.message);
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
   GET LOGIN MODAL SETTING - ADMIN
   GET /api/login-modal-settings
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Login modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE LOGIN MODAL SETTING - PUBLIC
   GET /api/login-modal-settings/public/active
====================================================== */

router.get("/public/active", async (req, res) => {
  try {
    const setting = await LoginModalSetting.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      "Login modal setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE LOGIN MODAL SETTING
   PUT /api/login-modal-settings
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
      "Login modal setting updated successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE LOGIN LOGO
   DELETE /api/login-modal-settings/logo
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
      "Login modal logo removed successfully",
      formatSetting(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET LOGIN MODAL SETTING
   PATCH /api/login-modal-settings/reset
====================================================== */

router.patch("/reset", protectAdmin, async (req, res) => {
  try {
    const oldSetting = await getOrCreateSetting();

    if (oldSetting.logo) deleteLocalFile(oldSetting.logo);

    await LoginModalSetting.findByIdAndDelete(oldSetting._id);

    const newSetting = await LoginModalSetting.create({});

    return successResponse(
      res,
      "Login modal setting reset successfully",
      formatSetting(req, newSetting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
