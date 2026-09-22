import express from "express";
import fs from "fs";
import path from "path";

import AffiliateCommissionSetting from "../models/AffiliateCommissionSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const localizedFields = [
  "flowTitle",
  "tableHeadActivePlayers",
  "tableHeadPlayerLoss",
  "tableHeadCommission",
];

const colorFields = [
  "sectionBg",
  "cardBg",
  "titleColor",
  "flowTextColor",
  "operatorColor",
  "headerGradientFrom",
  "headerGradientTo",
  "headerTextColor",
  "bottomBarBg",
];

const layoutFields = ["contentMaxWidth", "flowImageSize"];

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
    console.log("AFF COMMISSION FILE DELETE ERROR:", error.message);
  }
};

const getOrCreateSetting = async () => {
  let setting = await AffiliateCommissionSetting.findOne().sort({
    createdAt: -1,
  });

  if (!setting) setting = await AffiliateCommissionSetting.create({});
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
    flowItems: Array.isArray(obj.flowItems)
      ? obj.flowItems
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],
    tableRows: Array.isArray(obj.tableRows)
      ? obj.tableRows
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

/* GET /api/affiliate-commission-settings */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return successResponse(
      res,
      "Affiliate commission setting fetched successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* GET /api/affiliate-commission-settings/public/active */
router.get("/public/active", async (req, res) => {
  try {
    const setting = await AffiliateCommissionSetting.findOne({
      status: "active",
    }).sort({ createdAt: -1 });

    return successResponse(
      res,
      "Affiliate commission setting fetched successfully",
      setting ? addUrls(req, setting) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PUT /api/affiliate-commission-settings */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const fileMap = filesByField(req);

    localizedFields.forEach((field) => {
      setting[field] = normalizeLocalized(
        parseJson(req.body?.[field], setting[field]),
      );
    });

    const flowItems = parseJson(req.body?.flowItems, setting.flowItems || []);

    setting.flowItems = Array.isArray(flowItems)
      ? flowItems.map((item, index) => {
          const file = fileMap[`flowItems.${index}.image`];

          const flow = {
            image: cleanText(item?.image),
            text: normalizeLocalized(item?.text),
            operatorAfter: ["-", "="].includes(item?.operatorAfter)
              ? item.operatorAfter
              : "none",
            order: Number.isFinite(Number(item?.order))
              ? Number(item.order)
              : 0,
            status: item?.status === "inactive" ? "inactive" : "active",
          };

          if (file) {
            if (flow.image && !String(flow.image).startsWith("http")) {
              deleteLocalFile(flow.image);
            }

            flow.image = filePath(file);
          }

          return flow;
        })
      : [];

    const tableRows = parseJson(req.body?.tableRows, setting.tableRows || []);

    setting.tableRows = Array.isArray(tableRows)
      ? tableRows.map((item) => ({
          activePlayers: normalizeLocalized(item?.activePlayers),
          playerLoss: cleanText(item?.playerLoss),
          commission: cleanText(item?.commission),
          rowBg: cleanText(item?.rowBg) || "#b9efff",
          textColor: cleanText(item?.textColor) || "#333333",
          order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
          status: item?.status === "inactive" ? "inactive" : "active",
        }))
      : [];

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    layoutFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        setting[field] = cleanText(req.body[field]) || setting[field];
      }
    });

    setting.status = req.body?.status === "inactive" ? "inactive" : "active";

    await setting.save();

    return successResponse(
      res,
      "Affiliate commission setting updated successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-commission-settings/remove-image */
router.patch("/remove-image", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const parentId = cleanText(req.body?.parentId);

    const item = setting.flowItems.id(parentId);

    if (!item) return errorResponse(res, "Flow item not found", 404);

    deleteLocalFile(item.image);
    item.image = "";

    await setting.save();

    return successResponse(
      res,
      "Flow image removed successfully",
      addUrls(req, setting),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* PATCH /api/affiliate-commission-settings/reset-colors */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    setting.sectionBg = "transparent";
    setting.cardBg = "#edf5fa";
    setting.titleColor = "#192075";
    setting.flowTextColor = "#303030";
    setting.operatorColor = "#3a3a3a";
    setting.headerGradientFrom = "#1c5d9e";
    setting.headerGradientTo = "#4add13";
    setting.headerTextColor = "#ffffff";
    setting.bottomBarBg = "#4ad022";

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
