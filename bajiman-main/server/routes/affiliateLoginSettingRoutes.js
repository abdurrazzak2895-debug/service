import express from "express";
import fs from "fs";
import path from "path";

import AffiliateLoginSetting from "../models/AffiliateLoginSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const localizedFields = [
  "badgeText",
  "title",
  "subTitle",
  "usernameLabel",
  "passwordLabel",
  "validationCodeLabel",
  "loginText",
  "loggingInText",
  "noAccountText",
  "registerText",
  "forgotText",
];

const colorFields = [
  "pageBg",
  "leftCardBg",
  "leftCardBorder",
  "badgeBg",
  "badgeTextColor",
  "titleColor",
  "subTitleColor",
  "featureBg",
  "featureTextColor",
  "formCardBg",
  "formTextColor",
  "formTitleColor",
  "labelColor",
  "inputBg",
  "inputBorder",
  "inputFocusBorder",
  "inputIconColor",
  "captchaBg",
  "captchaBorder",
  "captchaTextColor",
  "refreshBg",
  "refreshTextColor",
  "submitBg",
  "submitTextColor",
  "forgotLinkColor",
  "registerLinkColor",
];

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
    console.log("AFF LOGIN FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateLoginSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateLoginSetting.create({});
  return setting;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    features: Array.isArray(obj.features)
      ? obj.features
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

/* GET /api/affiliate-login-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    return successResponse(
      res,
      "Affiliate login setting fetched",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-login-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateLoginSetting.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate login setting fetched",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-login-settings */
router.put("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    localizedFields.forEach((field) => {
      setting[field] = normalizeLocalized(
        parseJson(req.body?.[field], setting[field]),
      );
    });

    const features = parseJson(req.body?.features, setting.features || []);
    setting.features = Array.isArray(features)
      ? features.map((item) => ({
          text: normalizeLocalized(item?.text),
          order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
          status: item?.status === "inactive" ? "inactive" : "active",
        }))
      : [];

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    if (req.file) {
      const oldLogo = setting.logo;
      setting.logo = filePath(req.file);
      if (oldLogo) deleteLocalFile(oldLogo);
    }

    if (String(req.body?.removeLogo) === "true") {
      deleteLocalFile(setting.logo);
      setting.logo = "";
    }

    await setting.save();

    return successResponse(
      res,
      "Affiliate login setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (req.file?.path) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-login-settings/remove-logo */
router.patch("/remove-logo", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    deleteLocalFile(setting.logo);
    setting.logo = "";

    await setting.save();

    return successResponse(
      res,
      "Logo removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-login-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.pageBg = "#061532";
    setting.leftCardBg = "rgba(255,255,255,0.05)";
    setting.leftCardBorder = "rgba(255,255,255,0.10)";
    setting.badgeBg = "#ffcc18";
    setting.badgeTextColor = "#061532";
    setting.titleColor = "#ffffff";
    setting.subTitleColor = "rgba(255,255,255,0.75)";
    setting.featureBg = "#0c2c62";
    setting.featureTextColor = "#ffffff";
    setting.formCardBg = "#ffffff";
    setting.formTextColor = "#111111";
    setting.formTitleColor = "#061532";
    setting.labelColor = "#061532";
    setting.inputBg = "#f4f7fb";
    setting.inputBorder = "#d9e2ef";
    setting.inputFocusBorder = "#ffcc18";
    setting.inputIconColor = "#0b66a8";
    setting.captchaBg = "#061532";
    setting.captchaBorder = "#ffcc18";
    setting.captchaTextColor = "#ffcc18";
    setting.refreshBg = "#ffcc18";
    setting.refreshTextColor = "#061532";
    setting.submitBg = "#ffcc18";
    setting.submitTextColor = "#061532";
    setting.forgotLinkColor = "#0b66a8";
    setting.registerLinkColor = "#0b66a8";

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
