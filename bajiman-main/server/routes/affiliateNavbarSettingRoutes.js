import express from "express";
import fs from "fs";
import path from "path";

import AffiliateNavbarSetting from "../models/AffiliateNavbarSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const localizedFields = ["loginText", "registerText", "selectLanguageText"];

const parseJson = (value, fallback) => {
  try {
    if (typeof value === "undefined") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeLocalized = (value = {}) => ({
  bn: cleanText(value?.bn),
  en: cleanText(value?.en),
});

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, value = "") => {
  if (!value) return "";
  if (String(value).startsWith("http")) return value;

  const normalized = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (oldPath = "") => {
  try {
    if (!oldPath) return;
    if (String(oldPath).startsWith("http")) return;

    const fullPath = path.resolve(oldPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.log("AFF NAVBAR FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateNavbarSetting.findOne().sort({ createdAt: -1 });

  if (!setting) setting = await AffiliateNavbarSetting.create({});
  return setting;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
  };
};

/* GET /api/affiliate-navbar-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate navbar setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-navbar-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateNavbarSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate navbar setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-navbar-settings */
router.put("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    if (req.file) {
      deleteLocalFile(setting.logo);
      setting.logo = filePath(req.file);
    } else if (typeof req.body?.logo !== "undefined") {
      setting.logo = cleanText(req.body.logo);
    }

    localizedFields.forEach((field) => {
      setting[field] = normalizeLocalized(
        parseJson(req.body?.[field], setting[field]),
      );
    });

    [
      "loginPath",
      "registerPath",
      "navbarBg",
      "navbarBorderColor",
      "textColor",
      "loginButtonBg",
      "loginButtonHoverBg",
      "loginButtonBorderColor",
      "registerButtonBg",
      "registerButtonHoverBg",
      "buttonTextColor",
      "contentMaxWidth",
      "navbarHeight",
      "logoHeight",
    ].forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate navbar setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-navbar-settings/remove-logo */
router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    deleteLocalFile(setting.logo);
    setting.logo = "";

    await setting.save();

    return successResponse(
      res,
      "Navbar logo removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-navbar-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.navbarBg = "#dff8ff";
    setting.navbarBorderColor = "#0b1f33";
    setting.textColor = "#18344d";
    setting.loginButtonBg = "#2069b7";
    setting.loginButtonHoverBg = "#175ba3";
    setting.loginButtonBorderColor = "#0e62b8";
    setting.registerButtonBg = "#48b948";
    setting.registerButtonHoverBg = "#37a937";
    setting.buttonTextColor = "#ffffff";

    await setting.save();

    return successResponse(
      res,
      "Colors reset successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
