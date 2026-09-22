import express from "express";
import fs from "fs";
import path from "path";

import AffiliateFooterSetting from "../models/AffiliateFooterSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

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
    console.log("AFF FOOTER FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateFooterSetting.findOne().sort({ createdAt: -1 });
  if (!setting) setting = await AffiliateFooterSetting.create({});
  return setting;
};

const filesByField = (req) => {
  const map = {};
  if (!Array.isArray(req.files)) return map;

  req.files.forEach((file) => {
    map[file.fieldname] = file;
  });

  return map;
};

const addUrls = (req, doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc || {};

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    links: Array.isArray(obj.links)
      ? obj.links
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
    socials: Array.isArray(obj.socials)
      ? obj.socials
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            iconUrl: item.icon ? buildFileUrl(req, item.icon) : "",
          }))
      : [],
  };
};

/* GET /api/affiliate-footer-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate footer setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-footer-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateFooterSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate footer setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-footer-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    const logoFile = fileMap.logo;
    if (logoFile) {
      deleteLocalFile(setting.logo);
      setting.logo = filePath(logoFile);
    } else if (typeof req.body?.logo !== "undefined") {
      setting.logo = cleanText(req.body.logo);
    }

    ["followText", "signupText", "signupButtonText", "copyrightText"].forEach(
      (field) => {
        setting[field] = normalizeLocalized(
          parseJson(req.body?.[field], setting[field]),
        );
      },
    );

    const links = parseJson(req.body?.links, setting.links || []);
    setting.links = Array.isArray(links)
      ? links.map((item) => ({
          label: normalizeLocalized(item?.label),
          path: cleanText(item?.path) || "#",
          order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
          status: item?.status === "inactive" ? "inactive" : "active",
        }))
      : [];

    const socials = parseJson(req.body?.socials, setting.socials || []);
    setting.socials = Array.isArray(socials)
      ? socials.map((item, index) => {
          const file = fileMap[`socials.${index}.icon`];

          const social = {
            name: cleanText(item?.name),
            icon: cleanText(item?.icon),
            url: cleanText(item?.url) || "#",
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (social.icon && !String(social.icon).startsWith("http")) {
              deleteLocalFile(social.icon);
            }
            social.icon = filePath(file);
          }

          return social;
        })
      : [];

    [
      "signupButtonPath",
      "footerBg",
      "textColor",
      "linkHoverColor",
      "buttonBg",
      "buttonHoverBg",
      "buttonTextColor",
      "contentMaxWidth",
      "logoWidth",
      "socialIconSize",
    ].forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate footer setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-footer-settings/remove-logo */
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

/* PATCH /api/affiliate-footer-settings/remove-social-icon */
router.patch("/remove-social-icon", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const parentId = cleanText(req.body?.parentId);

    const item = setting.socials.id(parentId);
    if (!item) return errorResponse(res, "Social item not found", 404);

    deleteLocalFile(item.icon);
    item.icon = "";

    await setting.save();

    return successResponse(
      res,
      "Social icon removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-footer-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.footerBg = "#dff8ff";
    setting.textColor = "#07192c";
    setting.linkHoverColor = "#176bb5";
    setting.buttonBg = "#4bd914";
    setting.buttonHoverBg = "#3ec40d";
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
