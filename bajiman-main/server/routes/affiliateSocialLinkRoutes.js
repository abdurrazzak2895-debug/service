import express from "express";
import fs from "fs";
import path from "path";

import AffiliateSocialLink from "../models/AffiliateSocialLink.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const removeFile = (file = "") => {
  try {
    if (!file || String(file).startsWith("http")) return;

    const fullPath = path.resolve(file);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.log("FILE REMOVE ERROR:", err.message);
  }
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, value = "") => {
  if (!value) return "";
  if (String(value).startsWith("http")) return value;

  const clean = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${clean}`;
};

export const formatAffiliateSocialLink = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    iconUrl: buildFileUrl(req, obj.icon),
  };
};

/* =========================================================
   GET ACTIVE AFFILIATE SOCIAL LINKS
   GET /api/affiliate-social-link
========================================================= */
router.get("/", async (req, res) => {
  try {
    const items = await AffiliateSocialLink.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate social links fetched successfully",
      items.map((item) => formatAffiliateSocialLink(req, item)),
    );
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
});

/* =========================================================
   ADMIN GET ALL
   GET /api/affiliate-social-link/admin
========================================================= */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const items = await AffiliateSocialLink.find({}).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Affiliate social links fetched successfully",
      items.map((item) => formatAffiliateSocialLink(req, item)),
    );
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
});

/* =========================================================
   CREATE
   POST /api/affiliate-social-link/admin
========================================================= */
router.post("/admin", protectAdmin, upload.single("icon"), async (req, res) => {
  try {
    const url = String(req.body?.url || "").trim();
    const order = Number(req.body?.order || 0);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!url) {
      if (req.file) removeFile(req.file.path);
      return errorResponse(res, "URL required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Icon required", 400);
    }

    const item = await AffiliateSocialLink.create({
      url,
      icon: filePath(req.file),
      order: Number.isFinite(order) ? order : 0,
      status,
    });

    return successResponse(
      res,
      "Affiliate social link added successfully",
      formatAffiliateSocialLink(req, item),
    );
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    return errorResponse(res, err.message || "Server error", 500);
  }
});

/* =========================================================
   UPDATE
   PUT /api/affiliate-social-link/admin/:id
========================================================= */
router.put(
  "/admin/:id",
  protectAdmin,
  upload.single("icon"),
  async (req, res) => {
    try {
      const item = await AffiliateSocialLink.findById(req.params.id);

      if (!item) {
        if (req.file) removeFile(req.file.path);
        return errorResponse(res, "Affiliate social link not found", 404);
      }

      const url = String(req.body?.url || "").trim();
      const order = Number(req.body?.order || 0);

      if (!url) {
        if (req.file) removeFile(req.file.path);
        return errorResponse(res, "URL required", 400);
      }

      item.url = url;
      item.order = Number.isFinite(order) ? order : 0;
      item.status = req.body?.status === "inactive" ? "inactive" : "active";

      if (req.file) {
        removeFile(item.icon);
        item.icon = filePath(req.file);
      }

      await item.save();

      return successResponse(
        res,
        "Affiliate social link updated successfully",
        formatAffiliateSocialLink(req, item),
      );
    } catch (err) {
      if (req.file) removeFile(req.file.path);
      return errorResponse(res, err.message || "Server error", 500);
    }
  },
);

/* =========================================================
   DELETE
   DELETE /api/affiliate-social-link/admin/:id
========================================================= */
router.delete("/admin/:id", protectAdmin, async (req, res) => {
  try {
    const item = await AffiliateSocialLink.findById(req.params.id);

    if (!item) {
      return errorResponse(res, "Affiliate social link not found", 404);
    }

    removeFile(item.icon);
    await item.deleteOne();

    return successResponse(res, "Affiliate social link deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message || "Server error", 500);
  }
});

export default router;
