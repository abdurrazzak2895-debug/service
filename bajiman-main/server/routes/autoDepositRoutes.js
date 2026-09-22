import express from "express";
import mongoose from "mongoose";
import axios from "axios";

import AutoDepositToken from "../models/AutoDepositToken.js";
import AutoDeposit from "../models/AutoDeposit.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";

import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

/* ----------------------------- HELPERS ----------------------------- */

async function getOrCreateSetting() {
  let setting = await AutoDepositToken.findOne();

  if (!setting) {
    setting = await AutoDepositToken.create({
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
      bonuses: [],
    });
  }

  return setting;
}

function normalizeMoney(value, fallback = 0) {
  const num = Math.floor(Number(value || 0));
  return Number.isFinite(num) ? num : fallback;
}

function safeString(value = "") {
  return String(value || "").trim();
}

function normalizeEligibleProviders(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      providerCode: String(item?.providerCode || "").trim().toUpperCase(),
      percent: Math.min(100, Math.max(0, Number(item?.percent ?? 100))),
    }))
    .filter((item) => item.providerCode);
}

function sumPercent(list) {
  return (Array.isArray(list) ? list : []).reduce(
    (sum, item) => sum + Number(item?.percent || 0),
    0,
  );
}

function defaultAffiliateCommission() {
  return {
    affiliatorId: "",
    affiliatorUserId: "",
    percent: 0,
    baseAmount: 0,
    commissionAmount: 0,
  };
}

function defaultSelectedBonus() {
  return {
    bonusId: "",
    title: { bn: "", en: "" },
    bonusType: "",
    bonusScope: "",
    bonusValue: 0,
    bonusAmount: 0,
    turnoverMultiplier: 1,
    eligibleProviders: [],
  };
}

function computeBonus({ amount, selectedBonus }) {
  const depositAmount = normalizeMoney(amount, 0);

  if (!selectedBonus) {
    return {
      depositAmount,
      bonusAmount: 0,
      creditedAmount: depositAmount,
      turnoverMultiplier: 1,
      targetTurnover: depositAmount,
      selectedBonus: defaultSelectedBonus(),
    };
  }

  const bonusType =
    String(selectedBonus?.bonusType || "fixed").toLowerCase() === "percent"
      ? "percent"
      : "fixed";

  const bonusScope =
    selectedBonus?.bonusScope === "first-deposit"
      ? "first-deposit"
      : "all-time";

  const bonusValue = Number(selectedBonus?.bonusValue || 0);

  const bonusAmount =
    bonusType === "percent"
      ? Math.floor((depositAmount * bonusValue) / 100)
      : Math.floor(bonusValue);

  const turnoverMultiplier = Math.max(
    Number(selectedBonus?.turnoverMultiplier ?? 1),
    0,
  );

  const creditedAmount = depositAmount + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    depositAmount,
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
    selectedBonus: {
      bonusId: String(selectedBonus?._id || ""),
      title: {
        bn: selectedBonus?.title?.bn || "",
        en: selectedBonus?.title?.en || "",
      },
      bonusType,
      bonusScope,
      bonusValue,
      bonusAmount,
      turnoverMultiplier,
      eligibleProviders: Array.isArray(selectedBonus?.eligibleProviders)
        ? selectedBonus.eligibleProviders
        : [],
    },
  };
}

function buildPublicUrls() {
  return {
    backend: process.env.PUBLIC_BACKEND_URL,
    frontend: process.env.PUBLIC_FRONTEND_URL,
  };
}

/* ----------------------------- ADMIN: GET SETTINGS ----------------------------- */

router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const bonuses = Array.isArray(setting.bonuses)
      ? [...setting.bonuses]
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((bonus) => ({
            _id: String(bonus._id),
            title: {
              bn: bonus?.title?.bn || "",
              en: bonus?.title?.en || "",
            },
            bonusType: bonus?.bonusType || "fixed",
            bonusScope:
              bonus?.bonusScope === "first-deposit"
                ? "first-deposit"
                : "all-time",
            bonusValue: Number(bonus?.bonusValue || 0),
            turnoverMultiplier: Number(bonus?.turnoverMultiplier ?? 1),
            isActive: bonus?.isActive !== false,
            order: Number(bonus?.order || 0),
            eligibleProviders: Array.isArray(bonus?.eligibleProviders)
              ? bonus.eligibleProviders
              : [],
          }))
      : [];

    return res.json({
      success: true,
      data: {
        businessToken: setting.businessToken || "",
        active: !!setting.active,
        minAmount: Number(setting.minAmount || 5),
        maxAmount: Number(setting.maxAmount || 0),
        bonuses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: UPDATE SETTINGS ----------------------------- */

router.put("/admin", protectAdmin, async (req, res) => {
  try {
    const { businessToken, active, minAmount, maxAmount, bonuses } = req.body;

    const setting = await getOrCreateSetting();

    if (typeof businessToken === "string") {
      setting.businessToken = businessToken.trim();
    }

    if (typeof active === "boolean") {
      setting.active = active;
    }

    const min = normalizeMoney(minAmount, 5);
    const max = normalizeMoney(maxAmount, 0);

    setting.minAmount = Math.max(1, min);
    setting.maxAmount = Math.max(0, max);

    if (setting.maxAmount > 0 && setting.minAmount > setting.maxAmount) {
      return res.status(400).json({
        success: false,
        message: "minAmount cannot be greater than maxAmount",
      });
    }

    if (Array.isArray(bonuses)) {
      setting.bonuses = bonuses
        .map((item, index) => ({
          _id:
            item?._id && mongoose.Types.ObjectId.isValid(String(item._id))
              ? new mongoose.Types.ObjectId(String(item._id))
              : new mongoose.Types.ObjectId(),

          title: {
            bn: safeString(item?.title?.bn),
            en: safeString(item?.title?.en),
          },

          bonusType:
            String(item?.bonusType || "fixed").toLowerCase() === "percent"
              ? "percent"
              : "fixed",

          bonusScope:
            item?.bonusScope === "first-deposit" ? "first-deposit" : "all-time",

          bonusValue: Math.max(0, Number(item?.bonusValue || 0)),

          turnoverMultiplier: Math.max(
            0,
            Number(item?.turnoverMultiplier || 0),
          ),

          isActive: item?.isActive !== false,
          order: Math.max(0, normalizeMoney(item?.order, index)),

          eligibleProviders: normalizeEligibleProviders(
            item?.eligibleProviders,
          ),
        }))
        .filter(
          (item) =>
            item.title.bn &&
            item.title.en &&
            Number.isFinite(item.bonusValue) &&
            Number.isFinite(item.turnoverMultiplier),
        );

      for (const item of setting.bonuses) {
        if (sumPercent(item.eligibleProviders) > 100) {
          return res.status(400).json({
            success: false,
            message: `Bonus "${item.title.bn || item.title.en}" eligible providers' percent adds up to more than 100%`,
          });
        }
      }
    }

    await setting.save();

    return res.json({
      success: true,
      message: "Auto deposit settings updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Update failed",
    });
  }
});

/* ----------------------------- CLIENT: STATUS ----------------------------- */

router.get("/status", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const bonuses = Array.isArray(setting.bonuses)
      ? [...setting.bonuses]
          .filter((bonus) => bonus?.isActive !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((bonus) => ({
            _id: String(bonus._id),
            title: {
              bn: bonus?.title?.bn || "",
              en: bonus?.title?.en || "",
            },
            bonusType: bonus?.bonusType || "fixed",
            bonusScope:
              bonus?.bonusScope === "first-deposit"
                ? "first-deposit"
                : "all-time",
            bonusValue: Number(bonus?.bonusValue || 0),
            turnoverMultiplier: Number(bonus?.turnoverMultiplier ?? 1),
          }))
      : [];

    return res.json({
      success: true,
      data: {
        enabled: !!(setting.active && setting.businessToken),
        minAmount: Number(setting.minAmount || 5),
        maxAmount: Number(setting.maxAmount || 0),
        bonuses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- CLIENT: CREATE PAYMENT ----------------------------- */

router.post("/create", protectUser, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    if (!setting.active || !setting.businessToken) {
      return res.status(400).json({
        success: false,
        message: "Auto Deposit is disabled by admin.",
      });
    }

    const {
      amount,
      invoiceNumber,
      checkoutItems,
      selectedBonusId = "",
    } = req.body || {};

    const userIdentity = String(req.user?.id || "");
    const numAmount = normalizeMoney(amount, 0);

    if (!mongoose.Types.ObjectId.isValid(userIdentity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userIdentity",
      });
    }

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber required",
      });
    }

    if (!numAmount || numAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const minAmount = Number(setting.minAmount || 5);
    const maxAmount = Number(setting.maxAmount || 0);

    if (numAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && numAmount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum amount is ${maxAmount}`,
      });
    }

    const user = await User.findById(userIdentity).select(
      "_id userId phone role isActive referredBy depositCommission depositCommissionBalance",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    let selectedBonusDoc = null;

    if (
      selectedBonusId &&
      mongoose.Types.ObjectId.isValid(String(selectedBonusId))
    ) {
      const foundBonus = setting.bonuses.id(String(selectedBonusId));

      if (!foundBonus || foundBonus.isActive !== true) {
        return res.status(400).json({
          success: false,
          message: "Selected bonus is invalid or inactive",
        });
      }

      selectedBonusDoc = foundBonus;

      if (selectedBonusDoc?.bonusScope === "first-deposit") {
        const paidCount = await AutoDeposit.countDocuments({
          userIdentity,
          status: "PAID",
          balanceAdded: true,
        });

        if (paidCount > 0) {
          return res.status(400).json({
            success: false,
            message: "This bonus is only available for first auto deposit.",
          });
        }
      }
    }

    const calc = computeBonus({
      amount: numAmount,
      selectedBonus: selectedBonusDoc,
    });

    // await AutoDeposit.create({
    //   userIdentity,
    //   amount: numAmount,
    //   invoiceNumber: String(invoiceNumber),
    //   status: "PENDING",
    //   checkoutItems: {
    //     ...(checkoutItems || {}),
    //     selectedBonusId: calc.selectedBonus.bonusId || "",
    //   },
    //   selectedBonus: calc.selectedBonus,
    //   calc: {
    //     depositAmount: calc.depositAmount,
    //     bonusAmount: calc.bonusAmount,
    //     creditedAmount: calc.creditedAmount,
    //     turnoverMultiplier: calc.turnoverMultiplier,
    //     targetTurnover: calc.targetTurnover,
    //     affiliateDepositCommission: defaultAffiliateCommission(),
    //   },
    // });

    const { backend, frontend } = buildPublicUrls();

    if (!backend || !frontend) {
      return res.status(500).json({
        success: false,
        message: "PUBLIC_BACKEND_URL and PUBLIC_FRONTEND_URL are required",
      });
    }

    const callbackUrl = `${backend}/api/auto-deposit/webhook`;
    const successRedirectUrl = `${frontend}`;

    const opayRes = await axios.post(
      "https://api.oraclepay.org/api/opay-business/generate-payment-page",
      {
        payment_amount: numAmount,
        user_identity_address: userIdentity,
        callback_url: callbackUrl,
        success_redirect_url: successRedirectUrl,
        checkout_items: {
          ...(checkoutItems || {}),
          selectedBonusId: calc.selectedBonus.bonusId || "",
          selectedBonusType: calc.selectedBonus.bonusType || "",
          selectedBonusScope: calc.selectedBonus.bonusScope || "",
          selectedBonusTitleBn: calc.selectedBonus.title.bn || "",
          selectedBonusTitleEn: calc.selectedBonus.title.en || "",
        },
        invoice_number: String(invoiceNumber),
      },
      {
        headers: {
          "X-Opay-Business-Token": String(setting.businessToken || "").trim(),
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    if (!opayRes?.data?.success || !opayRes?.data?.payment_page_url) {
      await AutoDeposit.updateOne(
        { invoiceNumber: String(invoiceNumber) },
        { $set: { status: "FAILED" } },
      );

      return res.status(400).json({
        success: false,
        message: "Failed to create payment link",
        data: opayRes?.data || null,
      });
    }

    return res.json({
      success: true,
      payment_page_url: opayRes.data.payment_page_url,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber already exists. Try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Create payment failed",
    });
  }
});

/* ----------------------------- USER: HISTORY ----------------------------- */

router.get("/history/my", protectUser, async (req, res) => {
  try {
    const userId = String(req.user?.id || "");

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const status = safeString(req.query.status).toUpperCase();

    const filter = {
      userIdentity: userId,
    };

    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      AutoDeposit.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AutoDeposit.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: HISTORY ----------------------------- */

router.get("/deposits/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const q = safeString(req.query.q);
    const status = safeString(req.query.status).toUpperCase();
    const userId = safeString(req.query.userId);

    const matchStage = {};

    if (userId) {
      matchStage.userIdentity = userId;
    }

    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      matchStage.status = status;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: "$userIdentity",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          summaryAmount: {
            $ifNull: ["$calc.creditedAmount", "$amount"],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      ...(q
        ? [
            {
              $match: {
                $or: [
                  { "user.userId": { $regex: q, $options: "i" } },
                  { "user.phone": { $regex: q, $options: "i" } },
                  { invoiceNumber: { $regex: q, $options: "i" } },
                  { transactionId: { $regex: q, $options: "i" } },
                  { "selectedBonus.title.bn": { $regex: q, $options: "i" } },
                  { "selectedBonus.title.en": { $regex: q, $options: "i" } },
                  { "selectedBonus.bonusScope": { $regex: q, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                userIdentity: 1,
                amount: 1,
                invoiceNumber: 1,
                status: 1,
                checkoutItems: 1,
                transactionId: 1,
                sessionCode: 1,
                bank: 1,
                footprint: 1,
                paidAt: 1,
                createdAt: 1,
                updatedAt: 1,
                balanceAdded: 1,
                selectedBonus: 1,
                calc: 1,
                userMongoId: "$userObjectId",
                userDbUserId: { $ifNull: ["$user.userId", "Unknown"] },
                userPhone: { $ifNull: ["$user.phone", ""] },
                userRole: { $ifNull: ["$user.role", "user"] },
              },
            },
          ],
          total: [{ $count: "count" }],
          summary: [
            {
              $group: {
                _id: "$status",
                amount: { $sum: "$summaryAmount" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const result = await AutoDeposit.aggregate(pipeline);

    const data = result?.[0]?.data || [];
    const total = result?.[0]?.total?.[0]?.count || 0;
    const summaryRows = result?.[0]?.summary || [];

    const summary = {
      paidAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };

    summaryRows.forEach((row) => {
      const st = String(row?._id || "PENDING").toUpperCase();

      if (st === "PAID") {
        summary.paidAmount = Number(row.amount || 0);
        summary.paidCount = Number(row.count || 0);
      } else if (st === "FAILED") {
        summary.failedAmount = Number(row.amount || 0);
        summary.failedCount = Number(row.count || 0);
      } else {
        summary.pendingAmount = Number(row.amount || 0);
        summary.pendingCount = Number(row.count || 0);
      }
    });

    return res.json({
      success: true,
      data,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- WEBHOOK ----------------------------- */

router.post("/webhook", async (req, res) => {
  res.send("OK");

  try {
    const data = req.body || {};

    const invoiceNumber = safeString(data.invoice_number);
    const userId = safeString(data.user_identity);
    const statusRaw = safeString(data.status).toUpperCase();
    const amount = normalizeMoney(data.amount, 0);

    if (!invoiceNumber) return console.log("invoice_number missing");
    if (!userId) return console.log("user_identity missing");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return console.log("invalid user id");
    }

    if (!amount || amount <= 0) {
      return console.log("invalid amount");
    }

    const isCompleted = statusRaw === "COMPLETED";

    let deposit = await AutoDeposit.findOne({ invoiceNumber });

    if (!deposit) {
      deposit = await AutoDeposit.create({
        userIdentity: userId,
        amount,
        invoiceNumber,
        status: isCompleted ? "PAID" : "PENDING",
        transactionId: safeString(data.transaction_id),
        sessionCode: safeString(data.session_code),
        bank: safeString(data.bank),
        footprint: safeString(data.footprint),
        checkoutItems: data.checkout_items || {},
        paidAt: isCompleted ? new Date() : null,
        balanceAdded: false,
        selectedBonus: defaultSelectedBonus(),
        calc: {
          depositAmount: amount,
          bonusAmount: 0,
          creditedAmount: amount,
          turnoverMultiplier: 1,
          targetTurnover: amount,
          affiliateDepositCommission: defaultAffiliateCommission(),
        },
      });
    } else {
      deposit.transactionId =
        safeString(data.transaction_id) || deposit.transactionId || "";
      deposit.sessionCode =
        safeString(data.session_code) || deposit.sessionCode || "";
      deposit.bank = safeString(data.bank) || deposit.bank || "";
      deposit.footprint = safeString(data.footprint) || deposit.footprint || "";
      deposit.checkoutItems =
        data.checkout_items || deposit.checkoutItems || {};
      deposit.status = isCompleted ? "PAID" : "PENDING";
      deposit.paidAt = isCompleted ? new Date() : deposit.paidAt;
    }

    const settings = await AutoDepositToken.findOne();

    const incomingCheckoutItems =
      data.checkout_items || deposit.checkoutItems || {};

    const selectedBonusId = safeString(
      incomingCheckoutItems.selectedBonusId ||
        incomingCheckoutItems.selectedBonusID ||
        deposit?.selectedBonus?.bonusId,
    );

    let selectedBonusDoc = null;

    if (
      settings &&
      selectedBonusId &&
      mongoose.Types.ObjectId.isValid(selectedBonusId)
    ) {
      const foundBonus = settings.bonuses.id(selectedBonusId);

      if (foundBonus && foundBonus.isActive !== false) {
        selectedBonusDoc = foundBonus;
      }
    }

    const calc = computeBonus({
      amount,
      selectedBonus: selectedBonusDoc,
    });

    const prevAffiliateInfo =
      deposit?.calc?.affiliateDepositCommission &&
      typeof deposit.calc.affiliateDepositCommission === "object"
        ? {
            affiliatorId: String(
              deposit.calc.affiliateDepositCommission.affiliatorId || "",
            ),
            affiliatorUserId: String(
              deposit.calc.affiliateDepositCommission.affiliatorUserId || "",
            ),
            percent: Number(
              deposit.calc.affiliateDepositCommission.percent || 0,
            ),
            baseAmount: Number(
              deposit.calc.affiliateDepositCommission.baseAmount || 0,
            ),
            commissionAmount: Number(
              deposit.calc.affiliateDepositCommission.commissionAmount || 0,
            ),
          }
        : defaultAffiliateCommission();

    deposit.amount = amount;
    deposit.checkoutItems = incomingCheckoutItems;
    deposit.selectedBonus = calc.selectedBonus;
    deposit.calc = {
      depositAmount: Number(calc.depositAmount || 0),
      bonusAmount: Number(calc.bonusAmount || 0),
      creditedAmount: Number(calc.creditedAmount || 0),
      turnoverMultiplier: Number(calc.turnoverMultiplier ?? 1),
      targetTurnover: Number(calc.targetTurnover ?? 0),
      affiliateDepositCommission: prevAffiliateInfo,
    };

    await deposit.save();

    if (!isCompleted) return;
    if (deposit.balanceAdded === true) return;

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    if (user.isActive === false) throw new Error("User is inactive");

    const creditedAmount = Number(
      deposit?.calc?.creditedAmount ?? deposit.amount ?? 0,
    );

    const targetTurnover = Number(
      deposit?.calc?.targetTurnover ?? deposit.amount ?? 0,
    );

    user.balance = Number(user.balance || 0) + creditedAmount;
    await user.save();

    let affiliateCommissionInfo = defaultAffiliateCommission();

    if (user.referredBy) {
      const affiliator = await User.findById(user.referredBy);

      if (affiliator && affiliator.role === "aff-user" && affiliator.isActive) {
        const pct = Number(affiliator.depositCommission || 0);

        if (Number.isFinite(pct) && pct > 0) {
          const commissionBase = Number(deposit.amount || 0);
          const commissionAmount = (commissionBase * pct) / 100;

          if (commissionAmount > 0) {
            affiliator.depositCommissionBalance =
              Number(affiliator.depositCommissionBalance || 0) +
              commissionAmount;

            await affiliator.save();

            affiliateCommissionInfo = {
              affiliatorId: String(affiliator._id || ""),
              affiliatorUserId: String(affiliator.userId || ""),
              percent: Number(pct || 0),
              baseAmount: Number(commissionBase || 0),
              commissionAmount: Number(commissionAmount || 0),
            };
          }
        }
      }
    }

    deposit.balanceAdded = true;
    deposit.calc = {
      depositAmount: Number(
        deposit?.calc?.depositAmount || deposit.amount || 0,
      ),
      bonusAmount: Number(deposit?.calc?.bonusAmount || 0),
      creditedAmount: Number(
        deposit?.calc?.creditedAmount || deposit.amount || 0,
      ),
      turnoverMultiplier: Number(deposit?.calc?.turnoverMultiplier ?? 1),
      targetTurnover: Number(
        deposit?.calc?.targetTurnover ?? deposit.amount ?? 0,
      ),
      affiliateDepositCommission: affiliateCommissionInfo,
    };

    await deposit.save();

    const existingTurnover = await TurnOver.findOne({
      user: user._id,
      sourceType: "auto-deposit",
      sourceId: deposit._id,
    });

    if (!existingTurnover) {
      await TurnOver.create({
        user: user._id,
        sourceType: "auto-deposit",
        sourceId: deposit._id,
        required: targetTurnover,
        progress: 0,
        status: targetTurnover <= 0 ? "completed" : "running",
        creditedAmount,
        completedAt: targetTurnover <= 0 ? new Date() : null,
        eligibleProviders: deposit?.selectedBonus?.eligibleProviders || [],
      });
    }

    console.log("✅ auto deposit webhook processed:", {
      invoiceNumber,
      amount: deposit.amount,
      bonusScope: deposit?.selectedBonus?.bonusScope || "",
      bonusAmount: deposit?.calc?.bonusAmount || 0,
      creditedAmount: deposit?.calc?.creditedAmount || 0,
      targetTurnover: deposit?.calc?.targetTurnover || 0,
    });
  } catch (error) {
    console.error("auto-deposit webhook error:", error?.message || error);
  }
});

export default router;
