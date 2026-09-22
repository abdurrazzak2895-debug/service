import express from "express";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
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

const normalizeBonusScope = (value = "") => {
  return String(value || "").trim() === "first-deposit"
    ? "first-deposit"
    : "all-time";
};

const normalizeEligibleProviders = (value) => {
  const list = safeParseJSON(value, []);
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => ({
      providerCode: String(item?.providerCode || "").trim().toUpperCase(),
      percent: Math.min(100, Math.max(0, Number(item?.percent ?? 100))),
    }))
    .filter((item) => item.providerCode);
};

const sumPercent = (list) =>
  (Array.isArray(list) ? list : []).reduce(
    (sum, item) => sum + Number(item?.percent || 0),
    0,
  );

/* ---------------- ADMIN GET ALL ---------------- */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const data = await DepositBonusTurnover.find()
      .populate("depositMethod")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deposit bonus configs fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET deposit bonus configs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit bonus configs",
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

    const data = await DepositBonusTurnover.findOne({
      depositMethod: req.params.methodId,
    }).populate("depositMethod");

    return res.status(200).json({
      success: true,
      message: "Deposit bonus config fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET single deposit bonus config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit bonus config",
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

    const channels = safeParseJSON(body.channels, []).map((item, index) => ({
      id: String(item?.id || `channel-${Date.now()}-${index}`).trim(),
      name: normalizeTextBi(item?.name || {}),
      tagText: String(item?.tagText || "+0%").trim(),
      bonusTitle: normalizeTextBi(item?.bonusTitle || {}),
      bonusPercent: Math.max(0, Number(item?.bonusPercent || 0)),
      isActive: item?.isActive !== false && item?.isActive !== "false",
    }));

    const promotions = safeParseJSON(body.promotions, []).map(
      (item, index) => ({
        id: String(item?.id || `promotion-${Date.now()}-${index}`)
          .trim()
          .toLowerCase(),
        name: normalizeTextBi(item?.name || {}),
        bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
        bonusValue: Math.max(0, Number(item?.bonusValue || 0)),
        turnoverMultiplier: Math.max(0, Number(item?.turnoverMultiplier ?? 1)),
        bonusScope: normalizeBonusScope(item?.bonusScope),
        isActive: item?.isActive !== false && item?.isActive !== "false",
        sort: Number(item?.sort ?? index),
        eligibleProviders: normalizeEligibleProviders(item?.eligibleProviders),
      }),
    );

    const turnoverMultiplier = Math.max(
      0,
      Number(body.turnoverMultiplier ?? 1),
    );

    const eligibleProviders = normalizeEligibleProviders(
      body.eligibleProviders,
    );

    if (sumPercent(eligibleProviders) > 100) {
      return res.status(400).json({
        success: false,
        message: "Default eligible providers' percent adds up to more than 100%",
      });
    }

    for (const promo of promotions) {
      if (sumPercent(promo.eligibleProviders) > 100) {
        return res.status(400).json({
          success: false,
          message: `Promotion "${promo.id}" eligible providers' percent adds up to more than 100%`,
        });
      }
    }

    const data = await DepositBonusTurnover.findOneAndUpdate(
      { depositMethod },
      {
        depositMethod,
        turnoverMultiplier,
        eligibleProviders,
        channels,
        promotions,
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
      message: "Deposit bonus & turnover config saved successfully",
      data,
    });
  } catch (error) {
    console.error("UPSERT deposit bonus config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save deposit bonus config",
      error: error.message,
    });
  }
});

export default router;
