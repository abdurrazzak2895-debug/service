import express from "express";
import fs from "fs";
import path from "path";

import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";

import upload from "../config/multer.js";

import { protectAdmin } from "../middleware/protectAdmin.js";

import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

/* ----------------------------------
   Helpers
----------------------------------- */

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";

  const normalized = filePath.replace(/\\/g, "/");

  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (filePath = "") => {
  try {
    if (!filePath) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.log("FILE DELETE ERROR:", err.message);
  }
};

const formatCategory = (req, category) => {
  const obj = category.toObject();

  return {
    ...obj,
    iconImageUrl: obj.iconImage ? buildFileUrl(req, obj.iconImage) : "",
  };
};

/* ----------------------------------
   CREATE CATEGORY
----------------------------------- */

router.post("/", protectAdmin, upload.single("iconImage"), async (req, res) => {
  try {
    const {
      categoryNameBn,
      categoryNameEn,
      categoryTitleBn,
      categoryTitleEn,
      order,
      status,
    } = req.body;

    if (!categoryNameBn?.trim() || !categoryNameEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return errorResponse(res, "Category name BN and EN required", 400);
    }

    if (!categoryTitleBn?.trim() || !categoryTitleEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return errorResponse(res, "Category title BN and EN required", 400);
    }

    const category = await GameCategory.create({
      categoryName: {
        bn: categoryNameBn.trim(),
        en: categoryNameEn.trim(),
      },

      categoryTitle: {
        bn: categoryTitleBn.trim(),
        en: categoryTitleEn.trim(),
      },

      iconImage: req.file ? req.file.path.replace(/\\/g, "/") : "",

      order: Number(order) || 0,

      status: status === "inactive" ? "inactive" : "active",
    });

    return successResponse(
      res,
      "Game category created successfully",
      formatCategory(req, category),
      201,
    );
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return errorResponse(
      res,
      error.message || "Failed to create category",
      500,
    );
  }
});

/* ----------------------------------
   ADMIN ALL CATEGORY
----------------------------------- */

router.get("/admin/all", protectAdmin, async (req, res) => {
  try {
    const categories = await GameCategory.find().sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Categories fetched successfully",
      categories.map((item) => formatCategory(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* ----------------------------------
   ACTIVE CATEGORY
----------------------------------- */

router.get("/", async (req, res) => {
  try {
    const categories = await GameCategory.find({
      status: "active",
    }).sort({
      order: 1,
      createdAt: -1,
    });

    return successResponse(
      res,
      "Categories fetched successfully",
      categories.map((item) => formatCategory(req, item)),
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* ----------------------------------
   SINGLE CATEGORY
----------------------------------- */

router.get("/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(
      res,
      "Category fetched successfully",
      formatCategory(req, category),
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* ----------------------------------
   UPDATE CATEGORY
----------------------------------- */

router.put(
  "/:id",
  protectAdmin,
  upload.single("iconImage"),
  async (req, res) => {
    try {
      const category = await GameCategory.findById(req.params.id);

      if (!category) {
        if (req.file) deleteLocalFile(req.file.path);

        return errorResponse(res, "Category not found", 404);
      }

      const {
        categoryNameBn,
        categoryNameEn,
        categoryTitleBn,
        categoryTitleEn,
        order,
        status,
        removeOldImage,
      } = req.body;

      const oldImage = category.iconImage;

      category.categoryName = {
        bn: categoryNameBn?.trim(),
        en: categoryNameEn?.trim(),
      };

      category.categoryTitle = {
        bn: categoryTitleBn?.trim(),
        en: categoryTitleEn?.trim(),
      };

      category.order = Number(order) || 0;

      category.status = status === "inactive" ? "inactive" : "active";

      if (req.file) {
        category.iconImage = req.file.path.replace(/\\/g, "/");
      } else if (removeOldImage === "true") {
        category.iconImage = "";
      }

      await category.save();

      if (req.file && oldImage) {
        deleteLocalFile(oldImage);
      }

      if (removeOldImage === "true" && !req.file && oldImage) {
        deleteLocalFile(oldImage);
      }

      return successResponse(
        res,
        "Category updated successfully",
        formatCategory(req, category),
      );
    } catch (error) {
      if (req.file) deleteLocalFile(req.file.path);

      return errorResponse(res, error.message, 500);
    }
  },
);

/* ----------------------------------
   DELETE CATEGORY
----------------------------------- */

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    const oldImage = category.iconImage;

    /* delete all providers */
    const providers = await GameProvider.find({
      categoryId: category._id,
    });

    const providerIds = providers.map((p) => p._id);

    /* delete all games */
    await Game.deleteMany({
      providerDbId: {
        $in: providerIds,
      },
    });

    /* delete providers */
    await GameProvider.deleteMany({
      categoryId: category._id,
    });

    /* delete category */
    await GameCategory.findByIdAndDelete(category._id);

    if (oldImage) {
      deleteLocalFile(oldImage);
    }

    return successResponse(
      res,
      "Category and related providers/games deleted successfully",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
