import express from "express";
import upload from "../config/multer.js";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js ";
import { protectAdmin, requireMother } from "../middleware/protectAdmin.js";

const router = express.Router();

const parseJSON = (value, fallback = {}) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value || fallback;
  } catch {
    return fallback;
  }
};

const normalizeFields = (fields = []) => {
  return (Array.isArray(fields) ? fields : []).map((field) => ({
    key: String(field?.key || "").trim(),

    label: {
      bn: String(field?.label?.bn || "").trim(),
      en: String(field?.label?.en || "").trim(),
    },

    placeholder: {
      bn: String(field?.placeholder?.bn || "").trim(),
      en: String(field?.placeholder?.en || "").trim(),
    },

    type: ["text", "number", "tel", "email"].includes(field?.type)
      ? field.type
      : "text",

    required: field?.required !== false,
  }));
};

const validateMethod = ({
  methodId,
  name,
  fields,
  minimumWithdrawAmount,
  maximumWithdrawAmount,
}) => {
  const mid = String(methodId || "").trim().toUpperCase();

  if (!mid) return "Method ID is required";

  if (!name?.bn?.trim() || !name?.en?.trim()) {
    return "Both BN and EN name are required";
  }

  const min = Number(minimumWithdrawAmount || 0);
  const max = Number(maximumWithdrawAmount || 0);

  if (!Number.isFinite(min) || min < 0) {
    return "Minimum withdraw amount must be valid";
  }

  if (!Number.isFinite(max) || max < 0) {
    return "Maximum withdraw amount must be valid";
  }

  if (max > 0 && min > max) {
    return "Minimum withdraw amount cannot exceed maximum";
  }

  for (const field of fields) {
    if (!field.key) return "Field key is required";

    if (!field.label?.bn || !field.label?.en) {
      return "Field label BN and EN are required";
    }
  }

  return null;
};

/**
 * PUBLIC: active affiliate withdraw methods
 * GET /api/aff-withdraw-methods
 */
router.get("/aff-withdraw-methods", async (_req, res) => {
  try {
    const methods = await AffWithdrawMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("public aff-withdraw-methods error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN: all affiliate withdraw methods
 * GET /api/admin/aff-withdraw-methods
 */
router.get(
  "/admin/aff-withdraw-methods",
  protectAdmin,
  requireMother,
  async (_req, res) => {
    try {
      const methods = await AffWithdrawMethod.find({})
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: methods,
      });
    } catch (error) {
      console.error("admin aff-withdraw-methods list error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: create affiliate withdraw method
 * POST /api/admin/aff-withdraw-methods
 */
router.post(
  "/admin/aff-withdraw-methods",
  protectAdmin,
  requireMother,
  upload.single("logo"),
  async (req, res) => {
    try {
      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const exists = await AffWithdrawMethod.findOne({ methodId });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
        });
      }

      const logoUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const doc = await AffWithdrawMethod.create({
        methodId,
        name,
        logoUrl,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
        fields,
        isActive,
      });

      return res.status(201).json({
        success: true,
        message: "Affiliate withdraw method created successfully",
        data: doc,
      });
    } catch (error) {
      console.error("create aff-withdraw-method error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: update affiliate withdraw method
 * PUT /api/admin/aff-withdraw-methods/:id
 */
router.put(
  "/admin/aff-withdraw-methods/:id",
  protectAdmin,
  requireMother,
  upload.single("logo"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await AffWithdrawMethod.findById(id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Withdraw method not found",
        });
      }

      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const exists = await AffWithdrawMethod.findOne({
        methodId,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
        });
      }

      doc.methodId = methodId;
      doc.name = name;
      doc.fields = fields;
      doc.minimumWithdrawAmount = minimumWithdrawAmount;
      doc.maximumWithdrawAmount = maximumWithdrawAmount;
      doc.isActive = isActive;

      if (req.file) {
        doc.logoUrl = `/uploads/${req.file.filename}`;
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Affiliate withdraw method updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("update aff-withdraw-method error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: delete affiliate withdraw method
 * DELETE /api/admin/aff-withdraw-methods/:id
 */
router.delete(
  "/admin/aff-withdraw-methods/:id",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await AffWithdrawMethod.findByIdAndDelete(id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Withdraw method not found",
        });
      }

      return res.json({
        success: true,
        message: "Affiliate withdraw method deleted successfully",
      });
    } catch (error) {
      console.error("delete aff-withdraw-method error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

export default router;