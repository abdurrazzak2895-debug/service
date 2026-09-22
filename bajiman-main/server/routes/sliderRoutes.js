import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import Slider from "../models/Slider.js";

import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const colorFields = [
  "sectionBg",
  "desktopSectionBg",
  "slideBg",
  "arrowColor",
  "arrowHoverColor",
  "paginationBg",
  "paginationActiveBg",
  "mobileSkeletonBg",
  "desktopSkeletonBg",
  "skeletonDotBg",
  "skeletonDotActiveBg",
];

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "#f5f5f5",
  slideBg: "#082056",
  arrowColor: "#9ca3af",
  arrowHoverColor: "#4b5563",
  paginationBg: "#7aa7d9",
  paginationActiveBg: "#2f79c9",
  mobileSkeletonBg: "rgba(255,255,255,0.2)",
  desktopSkeletonBg: "#d1d5db",
  skeletonDotBg: "rgba(122,167,217,0.5)",
  skeletonDotActiveBg: "#7aa7d9",
};

const buildColorPayload = (body = {}, fallback = {}) => {
  const payload = {};

  colorFields.forEach((field) => {
    payload[field] =
      cleanText(body?.[field]) || fallback?.[field] || defaultColors[field];
  });

  return payload;
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (String(filePath).startsWith("http")) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FILE DELETE ERROR:", error.message);
  }
};

const formatSlider = (req, item) => {
  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    desktopImageUrl: obj.desktopImage
      ? buildFileUrl(req, obj.desktopImage)
      : "",
    mobileImageUrl: obj.mobileImage ? buildFileUrl(req, obj.mobileImage) : "",
    promoImageUrl: obj.promoImage ? buildFileUrl(req, obj.promoImage) : "",
  };
};

const uploadFields = upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
  { name: "promoImage", maxCount: 1 },
]);

const cleanBiText = (value = {}) => ({
  bn: cleanText(value?.bn),
  en: cleanText(value?.en),
});

// promoTable is a nested structure (sections -> columns/rows) — multipart
// form bodies are flat key/value strings, so the client sends it as one
// JSON string field and this parses it back, falling back to
// "disabled/empty" on any malformed input instead of failing the whole
// request. Each section is either a multi-column table (columns.length
// > 0) or a plain list (no columns, one cell per row) — e.g. a deposit
// bonus's "Eligible Tier" table plus a separate "Eligible Games" list.
const parsePromoTable = (raw) => {
  let value;

  try {
    value = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    value = null;
  }

  if (!value || typeof value !== "object" || !Array.isArray(value.sections)) {
    return { enabled: false, sections: [] };
  }

  const sections = value.sections
    .map((section) => {
      const columns = Array.isArray(section?.columns)
        ? section.columns.map((col) => cleanBiText(col))
        : [];

      const rows = Array.isArray(section?.rows)
        ? section.rows
            .map((row) => ({
              cells: Array.isArray(row?.cells)
                ? row.cells.map((cell) => cleanBiText(cell))
                : [],
            }))
            .filter((row) => row.cells.some((cell) => cell.bn || cell.en))
        : [];

      return {
        label: cleanBiText(section?.label),
        columns,
        rows,
      };
    })
    .filter(
      (section) =>
        section.label.bn || section.label.en || section.rows.length > 0,
    );

  return {
    enabled: Boolean(value.enabled) && sections.length > 0,
    sections,
  };
};

const buildPromoPayload = (body = {}) => ({
  mode: body?.mode === "promo" ? "promo" : "link",
  link: cleanText(body?.link),
  promoTitle: {
    bn: cleanText(body?.promoTitleBn),
    en: cleanText(body?.promoTitleEn),
  },
  promoDescription: {
    bn: cleanText(body?.promoDescriptionBn),
    en: cleanText(body?.promoDescriptionEn),
  },
  promoTable: parsePromoTable(body?.promoTable),
});

/* ======================================================
   CREATE SLIDER
   POST /api/sliders
====================================================== */

router.post("/", protectAdmin, uploadFields, async (req, res) => {
  try {
    const desktopImageFile = req.files?.desktopImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];
    const promoImageFile = req.files?.promoImage?.[0];

    const cleanupUploads = () => {
      if (desktopImageFile) deleteLocalFile(desktopImageFile.path);
      if (mobileImageFile) deleteLocalFile(mobileImageFile.path);
      if (promoImageFile) deleteLocalFile(promoImageFile.path);
    };

    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";
    const promoPayload = buildPromoPayload(req.body);

    if (!desktopImageFile) {
      cleanupUploads();
      return errorResponse(res, "Desktop slider image is required", 400);
    }

    if (!mobileImageFile) {
      cleanupUploads();
      return errorResponse(res, "Mobile slider image is required", 400);
    }

    if (promoPayload.mode === "link" && !promoPayload.link) {
      cleanupUploads();
      return errorResponse(res, "Link is required in link mode", 400);
    }

    if (promoPayload.mode === "promo") {
      if (!promoImageFile) {
        cleanupUploads();
        return errorResponse(res, "Promo image is required in promo mode", 400);
      }

      if (!promoPayload.promoTitle.bn && !promoPayload.promoTitle.en) {
        cleanupUploads();
        return errorResponse(res, "Promo title is required in promo mode", 400);
      }
    }

    const slider = await Slider.create({
      desktopImage: filePath(desktopImageFile),
      mobileImage: filePath(mobileImageFile),
      promoImage: promoImageFile ? filePath(promoImageFile) : "",
      order: Number.isFinite(order) ? order : 0,
      status,
      ...promoPayload,
      ...buildColorPayload(req.body, defaultColors),
    });

    return successResponse(
      res,
      "Slider created successfully",
      formatSlider(req, slider),
      201,
    );
  } catch (error) {
    const desktopImageFile = req.files?.desktopImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];
    const promoImageFile = req.files?.promoImage?.[0];

    if (desktopImageFile) deleteLocalFile(desktopImageFile.path);
    if (mobileImageFile) deleteLocalFile(mobileImageFile.path);
    if (promoImageFile) deleteLocalFile(promoImageFile.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ALL SLIDERS - ADMIN
   GET /api/sliders
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const { status = "", page = 1, limit = 50 } = req.query || {};

    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [sliders, total] = await Promise.all([
      Slider.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Slider.countDocuments(query),
    ]);

    return successResponse(res, "Sliders fetched successfully", {
      sliders: sliders.map((item) => formatSlider(req, item)),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE SLIDERS - PUBLIC
   GET /api/sliders/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const sliders = await Slider.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Active sliders fetched successfully",
      sliders.map((item) => formatSlider(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET SINGLE SLIDER
   GET /api/sliders/:id
====================================================== */

router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid slider id", 400);
    }

    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return errorResponse(res, "Slider not found", 404);
    }

    return successResponse(
      res,
      "Slider fetched successfully",
      formatSlider(req, slider),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE SLIDER
   PUT /api/sliders/:id
====================================================== */

router.put("/:id", protectAdmin, uploadFields, async (req, res) => {
  try {
    const cleanupUploads = () => {
      const desktopImageFile = req.files?.desktopImage?.[0];
      const mobileImageFile = req.files?.mobileImage?.[0];
      const promoImageFile = req.files?.promoImage?.[0];

      if (desktopImageFile) deleteLocalFile(desktopImageFile.path);
      if (mobileImageFile) deleteLocalFile(mobileImageFile.path);
      if (promoImageFile) deleteLocalFile(promoImageFile.path);
    };

    if (!isValidObjectId(req.params.id)) {
      cleanupUploads();
      return errorResponse(res, "Invalid slider id", 400);
    }

    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      cleanupUploads();
      return errorResponse(res, "Slider not found", 404);
    }

    const desktopImageFile = req.files?.desktopImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];
    const promoImageFile = req.files?.promoImage?.[0];

    const oldDesktopImage = slider.desktopImage;
    const oldMobileImage = slider.mobileImage;
    const oldPromoImage = slider.promoImage;

    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";
    const promoPayload = buildPromoPayload(req.body);

    const removeDesktopImage = String(req.body?.removeDesktopImage) === "true";
    const removeMobileImage = String(req.body?.removeMobileImage) === "true";
    const removePromoImage = String(req.body?.removePromoImage) === "true";

    if (promoPayload.mode === "link" && !promoPayload.link) {
      cleanupUploads();
      return errorResponse(res, "Link is required in link mode", 400);
    }

    if (promoPayload.mode === "promo") {
      const willHavePromoImage =
        promoImageFile || (slider.promoImage && !removePromoImage);

      if (!willHavePromoImage) {
        cleanupUploads();
        return errorResponse(res, "Promo image is required in promo mode", 400);
      }

      if (!promoPayload.promoTitle.bn && !promoPayload.promoTitle.en) {
        cleanupUploads();
        return errorResponse(res, "Promo title is required in promo mode", 400);
      }
    }

    slider.order = Number.isFinite(order) ? order : 0;
    slider.status = status;
    slider.mode = promoPayload.mode;
    slider.link = promoPayload.link;
    slider.promoTitle = promoPayload.promoTitle;
    slider.promoDescription = promoPayload.promoDescription;
    slider.promoTable = promoPayload.promoTable;

    const colorPayload = buildColorPayload(req.body, slider);

    colorFields.forEach((field) => {
      slider[field] = colorPayload[field];
    });

    if (desktopImageFile) {
      slider.desktopImage = filePath(desktopImageFile);
    } else if (removeDesktopImage) {
      slider.desktopImage = "";
    }

    if (mobileImageFile) {
      slider.mobileImage = filePath(mobileImageFile);
    } else if (removeMobileImage) {
      slider.mobileImage = "";
    }

    if (promoImageFile) {
      slider.promoImage = filePath(promoImageFile);
    } else if (removePromoImage) {
      slider.promoImage = "";
    }

    await slider.save();

    if (
      desktopImageFile &&
      oldDesktopImage &&
      !String(oldDesktopImage).startsWith("http")
    ) {
      deleteLocalFile(oldDesktopImage);
    }

    if (
      mobileImageFile &&
      oldMobileImage &&
      !String(oldMobileImage).startsWith("http")
    ) {
      deleteLocalFile(oldMobileImage);
    }

    if (
      promoImageFile &&
      oldPromoImage &&
      !String(oldPromoImage).startsWith("http")
    ) {
      deleteLocalFile(oldPromoImage);
    }

    if (
      removeDesktopImage &&
      !desktopImageFile &&
      oldDesktopImage &&
      !String(oldDesktopImage).startsWith("http")
    ) {
      deleteLocalFile(oldDesktopImage);
    }

    if (
      removeMobileImage &&
      !mobileImageFile &&
      oldMobileImage &&
      !String(oldMobileImage).startsWith("http")
    ) {
      deleteLocalFile(oldMobileImage);
    }

    if (
      removePromoImage &&
      !promoImageFile &&
      oldPromoImage &&
      !String(oldPromoImage).startsWith("http")
    ) {
      deleteLocalFile(oldPromoImage);
    }

    return successResponse(
      res,
      "Slider updated successfully",
      formatSlider(req, slider),
    );
  } catch (error) {
    const desktopImageFile = req.files?.desktopImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];
    const promoImageFile = req.files?.promoImage?.[0];

    if (promoImageFile) deleteLocalFile(promoImageFile.path);

    if (desktopImageFile) deleteLocalFile(desktopImageFile.path);
    if (mobileImageFile) deleteLocalFile(mobileImageFile.path);

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET SLIDER COLORS ONLY
   PATCH /api/sliders/:id/reset-colors
====================================================== */

router.patch("/:id/reset-colors", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid slider id", 400);
    }

    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return errorResponse(res, "Slider not found", 404);
    }

    colorFields.forEach((field) => {
      slider[field] = defaultColors[field];
    });

    await slider.save();

    return successResponse(
      res,
      "Slider colors reset successfully",
      formatSlider(req, slider),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE SLIDER
   DELETE /api/sliders/:id
====================================================== */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid slider id", 400);
    }

    const slider = await Slider.findByIdAndDelete(req.params.id);

    if (!slider) {
      return errorResponse(res, "Slider not found", 404);
    }

    if (
      slider.desktopImage &&
      !String(slider.desktopImage).startsWith("http")
    ) {
      deleteLocalFile(slider.desktopImage);
    }

    if (slider.mobileImage && !String(slider.mobileImage).startsWith("http")) {
      deleteLocalFile(slider.mobileImage);
    }

    if (slider.promoImage && !String(slider.promoImage).startsWith("http")) {
      deleteLocalFile(slider.promoImage);
    }

    return successResponse(
      res,
      "Slider deleted successfully",
      formatSlider(req, slider),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
