import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import DepositRequest from "../models/DepositRequest.js";
import TurnOver from "../models/TurnOver.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const pickText = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const calcPromoBonus = ({ amount, promo }) => {
  if (!promo || promo.id === "none") return 0;

  if (promo.bonusType === "percent") {
    return (amount * n(promo.bonusValue)) / 100;
  }

  return n(promo.bonusValue);
};

const getChannelPercent = (channel = {}) => {
  const direct = n(channel?.bonusPercent);
  if (direct > 0) return direct;

  const tagText = String(channel?.tagText || "");
  if (!tagText.includes("%")) return 0;

  const parsed = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePromoScope = (value) =>
  value === "first-deposit" ? "first-deposit" : "all-time";

// A promo with its own non-empty eligibleProviders overrides the deposit
// method's default; otherwise the promo just inherits the default.
const resolveEligibleProviders = ({ config, promo }) => {
  if (promo?.eligibleProviders?.length) return promo.eligibleProviders;
  return Array.isArray(config?.eligibleProviders) ? config.eligibleProviders : [];
};

const getAffiliateDepositCommission = async ({ user, amount }) => {
  if (!user?.referredBy) {
    return {
      affiliatorId: "",
      affiliatorUserId: "",
      percent: 0,
      baseAmount: amount,
      commissionAmount: 0,
    };
  }

  const affiliator = await User.findById(user.referredBy);

  if (!affiliator || affiliator.role !== "aff-user") {
    return {
      affiliatorId: "",
      affiliatorUserId: "",
      percent: 0,
      baseAmount: amount,
      commissionAmount: 0,
    };
  }

  const percent = n(affiliator.depositCommission);
  const commissionAmount = (amount * percent) / 100;

  return {
    affiliatorId: String(affiliator._id),
    affiliatorUserId: affiliator.userId || "",
    percent,
    baseAmount: amount,
    commissionAmount,
  };
};

/* ---------------- ADMIN: SEARCH USERS ---------------- */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      role: "user",
      $or: [
        { userId: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id userId phone email balance currency isActive")
      .limit(20)
      .lean();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: OPTIONS ---------------- */
router.get("/options", protectAdmin, async (req, res) => {
  try {
    const methods = await DepositMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const methodIds = methods.map((m) => m._id);

    const configs = await DepositBonusTurnover.find({
      depositMethod: { $in: methodIds },
    }).lean();

    const configMap = new Map(configs.map((c) => [String(c.depositMethod), c]));

    const data = methods.map((method) => {
      const config = configMap.get(String(method._id)) || {};

      return {
        ...method,
        turnoverMultiplier: n(config.turnoverMultiplier ?? 1),
        channels: Array.isArray(config.channels) ? config.channels : [],
        promotions: Array.isArray(config.promotions) ? config.promotions : [],
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load manual deposit options",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: MANUAL CREDIT ---------------- */
router.post("/credit", protectAdmin, async (req, res) => {
  try {
    const {
      userId,
      methodId,
      channelId,
      promoId = "none",
      amount,
      adminNote = "",
    } = req.body || {};

    if (!userId || !isValidObjectId(userId)) {
      throw new Error("Valid userId is required");
    }

    const amountNum = n(amount);

    if (amountNum <= 0) {
      throw new Error("Valid amount is required");
    }

    if (!methodId || !channelId) {
      throw new Error("methodId and channelId are required");
    }

    const user = await User.findOne({
      _id: userId,
      role: "user",
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    const method = await DepositMethod.findOne({
      methodId: String(methodId).toLowerCase().trim(),
      isActive: true,
    });

    if (!method) {
      throw new Error("Deposit method not found or inactive");
    }

    const minDeposit = n(method.minDepositAmount);
    const maxDeposit = n(method.maxDepositAmount);

    if (minDeposit > 0 && amountNum < minDeposit) {
      throw new Error(`Minimum deposit amount is ${minDeposit}`);
    }

    if (maxDeposit > 0 && amountNum > maxDeposit) {
      throw new Error(`Maximum deposit amount is ${maxDeposit}`);
    }

    const config = await DepositBonusTurnover.findOne({
      depositMethod: method._id,
    });

    const channels = Array.isArray(config?.channels) ? config.channels : [];

    const channel = channels.find(
      (c) =>
        String(c?.id || "").trim() === String(channelId || "").trim() &&
        c?.isActive !== false,
    );

    if (!channel) {
      throw new Error("Deposit channel not found or inactive");
    }

    const promotions = Array.isArray(config?.promotions)
      ? config.promotions
      : [];

    let promo = null;

    if (promoId && promoId !== "none") {
      promo = promotions.find(
        (p) =>
          String(p?.id || "").toLowerCase() ===
            String(promoId || "").toLowerCase() && p?.isActive !== false,
      );

      if (!promo) {
        throw new Error("Promotion not found or inactive");
      }

      if (normalizePromoScope(promo?.bonusScope) === "first-deposit") {
        const previousApproved = await DepositRequest.exists({
          user: user._id,
          status: "approved",
        });

        if (previousApproved) {
          throw new Error("First deposit promotion already used");
        }
      }
    }

    const channelPercent = getChannelPercent(channel);
    const percentBonus = (amountNum * channelPercent) / 100;
    const promoBonus = calcPromoBonus({ amount: amountNum, promo });
    const totalBonus = percentBonus + promoBonus;

    const turnoverMultiplier =
      promo && promoId !== "none"
        ? n(promo?.turnoverMultiplier ?? 1)
        : n(config?.turnoverMultiplier ?? 1);

    const creditedAmount = amountNum + totalBonus;
    const targetTurnover = creditedAmount * turnoverMultiplier;
    const eligibleProviders = resolveEligibleProviders({ config, promo });

    const activeContacts = Array.isArray(method.contacts)
      ? method.contacts
          .filter((c) => c?.isActive !== false)
          .sort((a, b) => n(a?.sort) - n(b?.sort))
      : [];

    const contact = activeContacts[0] || null;

    const affiliateDepositCommission = await getAffiliateDepositCommission({
      user,
      amount: amountNum,
    });

    const doc = await DepositRequest.create({
      user: user._id,
      methodId: method.methodId,
      channelId: String(channelId).trim(),
      promoId: promoId || "none",
      amount: amountNum,

      fields: {
        source: "admin_manual_credit",
        adminMongoId: String(req.admin._id),
        adminEmail: req.admin.email || "",
      },

      calc: {
        channelPercent,
        percentBonus,
        promoBonus,
        totalBonus,
        turnoverMultiplier,
        targetTurnover,
        creditedAmount,
        eligibleProviders,
        affiliateDepositCommission,
      },

      status: "approved",
      adminNote,
      approvedBy: req.admin._id,
      approvedAt: new Date(),

      display: {
        methodName: pickText(method.methodName),
        channelName: pickText(channel.name),
        contactLabel: pickText(contact?.label),
        channelTagText: channel?.tagText || "",
        channelNumber: contact?.number || "",
        source: "Admin Manual Credit",
      },
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, role: "user", isActive: true },
      { $inc: { balance: creditedAmount } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) {
      await DepositRequest.deleteOne({ _id: doc._id });
      throw new Error("User not found or inactive");
    }

    const secondaryTasks = [];
    const affCom = affiliateDepositCommission || {};
    const affAmount = n(affCom.commissionAmount);

    if (affAmount > 0 && affCom.affiliatorId) {
      secondaryTasks.push(
        User.updateOne(
          { _id: affCom.affiliatorId, role: "aff-user" },
          {
            $inc: {
              commissionBalance: affAmount,
              depositCommissionBalance: affAmount,
            },
          },
        ),
      );
    }

    if (targetTurnover > 0) {
      secondaryTasks.push(
        TurnOver.findOneAndUpdate(
          {
            user: user._id,
            sourceType: "admin-manual-deposit",
            sourceId: doc._id,
          },
          {
            user: user._id,
            sourceType: "admin-manual-deposit",
            sourceId: doc._id,
            required: targetTurnover,
            progress: 0,
            status: "running",
            creditedAmount,
            eligibleProviders,
          },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
          },
        ),
      );
    }

    const secondaryResults = await Promise.allSettled(secondaryTasks);
    const warnings = secondaryResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "Secondary update failed");

    return res.json({
      success: true,
      message: "Manual deposit credited successfully",
      data: doc,
      balance: updatedUser.balance,
      creditedAmount,
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Manual deposit credit failed",
    });
  }
});

/* ---------------- ADMIN: SINGLE USER ALL DEPOSIT HISTORY ---------------- */
router.get(
  "/users/:userId/manual-deposit-history",
  protectAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 15, status = "all", search = "" } = req.query;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.min(Math.max(Number(limit) || 15, 1), 100);
      const skip = (pageNum - 1) * limitNum;

      const baseFilter = {
        user: new mongoose.Types.ObjectId(userId),
      };

      const filter = { ...baseFilter };

      if (["pending", "approved", "rejected"].includes(String(status))) {
        filter.status = String(status);
      }

      if (String(search).trim()) {
        const q = String(search).trim();
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        filter.$or = [
          { methodId: regex },
          { channelId: regex },
          { promoId: regex },
          { adminNote: regex },

          { "display.source": regex },
          { "display.methodName.bn": regex },
          { "display.methodName.en": regex },
          { "display.channelName.bn": regex },
          { "display.channelName.en": regex },
          { "display.channelNumber": regex },
          { "display.contactNumber": regex },

          { "fields.source": regex },
          { "fields.senderNumber": regex },
          { "fields.phone": regex },
          { "fields.number": regex },
          { "fields.from": regex },
          { "fields.walletNumber": regex },
          { "fields.trxid": regex },
          { "fields.trxId": regex },
          { "fields.transactionId": regex },
          { "fields.transaction_id": regex },
          { "fields.ref": regex },
          { "fields.reference": regex },
        ];
      }

      const [rows, total, summaryAgg] = await Promise.all([
        DepositRequest.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),

        DepositRequest.countDocuments(filter),

        DepositRequest.aggregate([
          { $match: baseFilter },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              amount: { $sum: { $ifNull: ["$amount", 0] } },
              bonusAmount: { $sum: { $ifNull: ["$calc.totalBonus", 0] } },
              creditedAmount: {
                $sum: { $ifNull: ["$calc.creditedAmount", 0] },
              },
              turnoverAmount: {
                $sum: { $ifNull: ["$calc.targetTurnover", 0] },
              },
            },
          },
        ]),
      ]);

      const empty = {
        count: 0,
        amount: 0,
        bonusAmount: 0,
        creditedAmount: 0,
        turnoverAmount: 0,
      };

      const summary = {
        total: { ...empty },
        pending: { ...empty },
        approved: { ...empty },
        rejected: { ...empty },
      };

      for (const item of summaryAgg) {
        const key = item._id || "pending";

        const value = {
          count: item.count || 0,
          amount: item.amount || 0,
          bonusAmount: item.bonusAmount || 0,
          creditedAmount: item.creditedAmount || 0,
          turnoverAmount: item.turnoverAmount || 0,
        };

        if (summary[key]) {
          summary[key] = value;
        }

        summary.total.count += value.count;
        summary.total.amount += value.amount;
        summary.total.bonusAmount += value.bonusAmount;
        summary.total.creditedAmount += value.creditedAmount;
        summary.total.turnoverAmount += value.turnoverAmount;
      }

      return res.json({
        success: true,
        message: "Single user deposit history fetched successfully",
        data: rows,
        summary,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
      });
    } catch (error) {
      console.error("Single user deposit history error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch deposit history",
        error: error.message,
      });
    }
  },
);

export default router;
