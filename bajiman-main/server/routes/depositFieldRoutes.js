import express from "express";
import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";
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

/* ---------------- ADMIN GET ALL ---------------- */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const data = await DepositFieldConfig.find()
      .populate("depositMethod")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deposit field configs fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET deposit field configs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit field configs",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN GET BY METHOD ID ---------------- */
router.get("/method/:methodId", protectAdmin, async (req, res) => {
  try {
    const method = await DepositMethod.findById(req.params.methodId);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    const data = await DepositFieldConfig.findOne({
      depositMethod: req.params.methodId,
    }).populate("depositMethod");

    return res.status(200).json({
      success: true,
      message: "Deposit field config fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET single deposit field config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit field config",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN UPSERT ---------------- */
router.post("/", protectAdmin, async (req, res) => {
  try {
    const body = req.body || {};

    const depositMethod = String(body.depositMethod || "").trim();

    if (!depositMethod) {
      return res.status(400).json({
        success: false,
        message: "depositMethod is required",
      });
    }

    const methodExists = await DepositMethod.findById(depositMethod);

    if (!methodExists) {
      return res.status(404).json({
        success: false,
        message: "Selected deposit method not found",
      });
    }

    const instructions = normalizeTextBi(safeParseJSON(body.instructions, {}));

    const inputs = safeParseJSON(body.inputs, []).map((item) => ({
      key: String(item?.key || "").trim(),
      label: normalizeTextBi(item?.label || {}),
      placeholder: normalizeTextBi(item?.placeholder || {}),
      type: ["text", "number", "tel"].includes(item?.type) ? item.type : "text",
      required: item?.required !== false && item?.required !== "false",
      minLength: Number(item?.minLength || 0),
      maxLength: Number(item?.maxLength || 0),
    }));

    for (const input of inputs) {
      if (!input.key) {
        return res.status(400).json({
          success: false,
          message: "Every input field must have a key",
        });
      }
    }

    const data = await DepositFieldConfig.findOneAndUpdate(
      { depositMethod },
      {
        depositMethod,
        instructions,
        inputs,
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).populate("depositMethod");

    return res.status(200).json({
      success: true,
      message: "Deposit field config saved successfully",
      data,
    });
  } catch (error) {
    console.error("UPSERT deposit field config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save deposit field config",
      error: error.message,
    });
  }
});

export default router;
