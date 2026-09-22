import express from "express";
import fs from "fs";
import path from "path";

import AffiliateRegisterSetting from "../models/AffiliateRegisterSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const colorFields = [
  "pageBg",
  "leftCardBg",
  "leftCardBorder",
  "badgeBg",
  "badgeTextColor",
  "titleColor",
  "subTitleColor",
  "commissionBg",
  "commissionTextColor",
  "noteBg",
  "noteTextColor",
  "noteIconColor",
  "formCardBg",
  "formTextColor",
  "formTitleColor",
  "labelColor",
  "inputBg",
  "inputBorder",
  "inputFocusBorder",
  "inputIconColor",
  "submitBg",
  "submitTextColor",
  "loginLinkColor",
];

const localizedFields = [
  "badgeText",
  "title",
  "subTitle",
  "commissionText",
  "formTitle",
  "usernameLabel",
  "phoneLabel",
  "emailLabel",
  "passwordLabel",
  "confirmPasswordLabel",
  "submitText",
  "submittingText",
  "alreadyText",
  "loginText",
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
    console.log("AFF REGISTER FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateRegisterSetting.findOne().sort({
    createdAt: -1,
  });
  if (!setting) setting = await AffiliateRegisterSetting.create({});
  return setting;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};
  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    notes: Array.isArray(obj.notes)
      ? obj.notes
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

/* GET /api/affiliate-register-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    return successResponse(
      res,
      "Affiliate register setting fetched",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-register-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateRegisterSetting.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate register setting fetched",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-register-settings */
router.put("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    localizedFields.forEach((field) => {
      setting[field] = normalizeLocalized(
        parseJson(req.body?.[field], setting[field]),
      );
    });

    const notes = parseJson(req.body?.notes, setting.notes || []);
    setting.notes = Array.isArray(notes)
      ? notes.map((item) => ({
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
      "Affiliate register setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (req.file?.path) deleteLocalFile(req.file.path);
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-register-settings/remove-logo */
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

/* PATCH /api/affiliate-register-settings/reset-colors */
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
    setting.commissionBg = "#ffcc18";
    setting.commissionTextColor = "#061532";
    setting.noteBg = "#0c2c62";
    setting.noteTextColor = "#ffffff";
    setting.noteIconColor = "#ffcc18";
    setting.formCardBg = "#ffffff";
    setting.formTextColor = "#111111";
    setting.formTitleColor = "#061532";
    setting.labelColor = "#061532";
    setting.inputBg = "#f4f7fb";
    setting.inputBorder = "#d9e2ef";
    setting.inputFocusBorder = "#ffcc18";
    setting.inputIconColor = "#0b66a8";
    setting.submitBg = "#ffcc18";
    setting.submitTextColor = "#061532";
    setting.loginLinkColor = "#0b66a8";

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
