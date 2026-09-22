import express from "express";

import Notice from "../models/Notice.js";

import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const colorFields = [
  "sectionBg",
  "desktopSectionBg",
  "iconColor",
  "desktopIconColor",
  "textColor",
  "desktopTextColor",
  "skeletonBg",
  "desktopSkeletonBg",
];

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "transparent",
  iconColor: "#ffffff",
  desktopIconColor: "#4b5563",
  textColor: "#ffffff",
  desktopTextColor: "#444444",
  skeletonBg: "rgba(255,255,255,0.4)",
  desktopSkeletonBg: "#d1d5db",
};

const buildColorPayload = (body = {}, fallback = {}) => {
  const payload = {};

  colorFields.forEach((field) => {
    payload[field] =
      cleanText(body?.[field]) || fallback?.[field] || defaultColors[field];
  });

  return payload;
};

/* ======================================================
   CREATE OR UPDATE SINGLE NOTICE
   POST /api/notice
====================================================== */
router.post("/", protectAdmin, async (req, res) => {
  try {
    const textBn = cleanText(req.body?.textBn);
    const textEn = cleanText(req.body?.textEn);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!textBn || !textEn) {
      return errorResponse(
        res,
        "Bangla and English notice text are required",
        400,
      );
    }

    const existing = await Notice.findOne();

    let notice;

    if (existing) {
      existing.text = {
        bn: textBn,
        en: textEn,
      };

      existing.status = status;

      const colorPayload = buildColorPayload(req.body, existing);

      colorFields.forEach((field) => {
        existing[field] = colorPayload[field];
      });

      await existing.save();
      notice = existing;
    } else {
      notice = await Notice.create({
        text: {
          bn: textBn,
          en: textEn,
        },
        status,
        ...buildColorPayload(req.body, defaultColors),
      });
    }

    return successResponse(res, "Notice saved successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET NOTICE - ADMIN
   GET /api/notice
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const notice = await Notice.findOne().sort({ createdAt: -1 });

    return successResponse(res, "Notice fetched successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE NOTICE - PUBLIC
   GET /api/notice/active
====================================================== */
router.get("/active", async (req, res) => {
  try {
    const notice = await Notice.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(res, "Active notice fetched successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET NOTICE COLORS ONLY
   PATCH /api/notice/reset-colors
====================================================== */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const notice = await Notice.findOne();

    if (!notice) {
      return errorResponse(res, "Notice not found", 404);
    }

    colorFields.forEach((field) => {
      notice[field] = defaultColors[field];
    });

    await notice.save();

    return successResponse(res, "Notice colors reset successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE NOTICE
   DELETE /api/notice
====================================================== */
router.delete("/", protectAdmin, async (req, res) => {
  try {
    const notice = await Notice.findOneAndDelete();

    if (!notice) {
      return errorResponse(res, "Notice not found", 404);
    }

    return successResponse(res, "Notice deleted successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
