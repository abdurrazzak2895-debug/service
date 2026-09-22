import express from "express";
import fs from "fs";
import path from "path";

import SocialLink from "../models/SocialLink.js";
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
    console.log(err.message);
  }
};

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, value = "") => {
  if (!value) return "";

  if (String(value).startsWith("http")) {
    return value;
  }

  const clean = String(value).replace(/\\/g, "/").replace(/^\/+/, "");

  return `${req.protocol}://${req.get("host")}/${clean}`;
};

const formatItem = (req, item) => {
  if (!item) return null;

  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,
    iconUrl: buildFileUrl(req, obj.icon),
  };
};

/* =========================================================
GET ACTIVE
========================================================= */

router.get("/", async (req, res) => {
  try {
    const items = await SocialLink.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Social links fetched successfully",
      items.map((item) => formatItem(req, item)),
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

/* =========================================================
ADMIN GET
========================================================= */

router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const items = await SocialLink.find({}).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Social links fetched successfully",
      items.map((item) => formatItem(req, item)),
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

/* =========================================================
CREATE
========================================================= */

router.post("/admin", protectAdmin, upload.single("icon"), async (req, res) => {
  try {
    const { url, nameBn, nameEn, order = 0, status = "active" } = req.body;

    if (!nameBn?.trim() || !nameEn?.trim()) {
      return errorResponse(res, "Name (Bangla & English) required", 400);
    }

    if (!url?.trim()) {
      return errorResponse(res, "URL required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "Icon required", 400);
    }

    const item = await SocialLink.create({
      name: { bn: nameBn.trim(), en: nameEn.trim() },
      url: url.trim(),
      icon: filePath(req.file),
      order: Number(order),
      status,
    });

    return successResponse(
      res,
      "Social link added successfully",
      formatItem(req, item),
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

/* =========================================================
UPDATE
========================================================= */

router.put(
  "/admin/:id",
  protectAdmin,
  upload.single("icon"),
  async (req, res) => {
    try {
      const item = await SocialLink.findById(req.params.id);

      if (!item) {
        return errorResponse(res, "Social link not found", 404);
      }

      item.name = {
        bn: req.body.nameBn?.trim() || item.name?.bn,
        en: req.body.nameEn?.trim() || item.name?.en,
      };
      item.url = req.body.url?.trim();
      item.order = Number(req.body.order || 0);
      item.status = req.body.status === "inactive" ? "inactive" : "active";

      if (req.file) {
        removeFile(item.icon);
        item.icon = filePath(req.file);
      }

      await item.save();

      return successResponse(
        res,
        "Social link updated successfully",
        formatItem(req, item),
      );
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },
);

/* =========================================================
DELETE
========================================================= */

router.delete("/admin/:id", protectAdmin, async (req, res) => {
  try {
    const item = await SocialLink.findById(req.params.id);

    if (!item) {
      return errorResponse(res, "Social link not found", 404);
    }

    removeFile(item.icon);

    await item.deleteOne();

    return successResponse(res, "Social link deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

export default router;
