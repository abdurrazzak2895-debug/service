import express from "express";
import mongoose from "mongoose";
import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const safeParseJSON = (value, fallback) => {
  try {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeTextBi = (value = {}) => ({
  bn: typeof value?.bn === "string" ? value.bn.trim() : "",
  en: typeof value?.en === "string" ? value.en.trim() : "",
});

const toSafeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const buildPayload = (req, oldLogoUrl = "") => {
  const body = req.body || {};

  const contacts = safeParseJSON(body.contacts, []).map((item, index) => ({
    id: String(item?.id || `contact-${Date.now()}-${index}`).trim(),
    label: normalizeTextBi(item?.label || {}),
    number: String(item?.number || "").trim(),
    isActive: item?.isActive !== false && item?.isActive !== "false",
    sort: Number(item?.sort ?? index),
  }));

  return {
    methodId: String(body.methodId || "")
      .trim()
      .toLowerCase(),
    methodName: normalizeTextBi(safeParseJSON(body.methodName, {})),
    methodType: ["personal", "agent"].includes(
      String(body.methodType || "").trim(),
    )
      ? String(body.methodType).trim()
      : "agent",
    logoUrl: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : oldLogoUrl,
    minDepositAmount: toSafeNumber(body.minDepositAmount, 0),
    maxDepositAmount: toSafeNumber(body.maxDepositAmount, 0),
    isActive: body.isActive === "false" ? false : true,
    contacts,
  };
};

/* ---------------- PUBLIC MERGED ROUTE ---------------- */
router.get("/public", async (req, res) => {
  try {
    const methods = await DepositMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const methodIds = methods.map((m) => m._id);

    const [fieldConfigs, bonusConfigs] = await Promise.all([
      DepositFieldConfig.find({
        depositMethod: { $in: methodIds },
      }).lean(),
      DepositBonusTurnover.find({
        depositMethod: { $in: methodIds },
      }).lean(),
    ]);

    const fieldMap = new Map(
      fieldConfigs.map((item) => [String(item.depositMethod), item]),
    );

    const bonusMap = new Map(
      bonusConfigs.map((item) => [String(item.depositMethod), item]),
    );

    const data = methods.map((method) => {
      const fieldConfig = fieldMap.get(String(method._id));
      const bonusConfig = bonusMap.get(String(method._id));

      return {
        ...method,
        instructions: fieldConfig?.instructions || { bn: "", en: "" },
        inputs: Array.isArray(fieldConfig?.inputs) ? fieldConfig.inputs : [],
        turnoverMultiplier: Number(bonusConfig?.turnoverMultiplier ?? 1) || 1,
        channels: Array.isArray(bonusConfig?.channels)
          ? bonusConfig.channels
          : [],
        promotions: Array.isArray(bonusConfig?.promotions)
          ? bonusConfig.promotions
          : [],
      };
    });

    return res.status(200).json({
      success: true,
      message: "Deposit methods fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET public deposit methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public deposit methods",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN GET ALL ---------------- */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const data = await DepositMethod.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deposit methods fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET deposit methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit methods",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN GET SINGLE ---------------- */
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit method id",
      });
    }

    const data = await DepositMethod.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deposit method fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET single deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit method",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN CREATE ---------------- */
router.post("/", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    const payload = buildPayload(req);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!payload.methodName.bn && !payload.methodName.en) {
      return res.status(400).json({
        success: false,
        message: "Method name is required",
      });
    }

    if (payload.minDepositAmount < 0 || payload.maxDepositAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Deposit amount cannot be negative",
      });
    }

    if (payload.minDepositAmount > payload.maxDepositAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum deposit amount cannot be greater than maximum deposit amount",
      });
    }

    const exists = await DepositMethod.findOne({ methodId: payload.methodId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This methodId already exists",
      });
    }

    const data = await DepositMethod.create(payload);

    return res.status(201).json({
      success: true,
      message: "Deposit method created successfully",
      data,
    });
  } catch (error) {
    console.error("CREATE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create deposit method",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN UPDATE ---------------- */
router.put("/:id", protectAdmin, upload.single("logo"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit method id",
      });
    }

    const existing = await DepositMethod.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    const payload = buildPayload(req, existing.logoUrl);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!payload.methodName.bn && !payload.methodName.en) {
      return res.status(400).json({
        success: false,
        message: "Method name is required",
      });
    }

    if (payload.minDepositAmount < 0 || payload.maxDepositAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Deposit amount cannot be negative",
      });
    }

    if (payload.minDepositAmount > payload.maxDepositAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum deposit amount cannot be greater than maximum deposit amount",
      });
    }

    const duplicate = await DepositMethod.findOne({
      methodId: payload.methodId,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another deposit method already uses this methodId",
      });
    }

    const data = await DepositMethod.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Deposit method updated successfully",
      data,
    });
  } catch (error) {
    console.error("UPDATE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update deposit method",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN DELETE ---------------- */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit method id",
      });
    }

    const data = await DepositMethod.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    await DepositFieldConfig.deleteOne({ depositMethod: req.params.id });
    await DepositBonusTurnover.deleteOne({ depositMethod: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Deposit method deleted successfully",
      data,
    });
  } catch (error) {
    console.error("DELETE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete deposit method",
      error: error.message,
    });
  }
});

export default router;
