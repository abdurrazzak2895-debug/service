import express from "express";
import mongoose from "mongoose";
import WithdrawRequest from "../models/WithdrawRequest.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import WithdrawMethod from "../models/WithdrawMethod.js";
import EWallet from "../models/EWallet.js";
import protectUser from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { getOrCreateOtpSetting } from "./otpSettingRoutes.js";
import { checkUserOtp, consumeUserOtp } from "./eWalletRoutes.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const getUserIdFromReq = (req) => {
  const id = req.user?.id || req.user?._id || null;
  return id ? String(id) : null;
};

const normalizeMethodId = (value) => String(value || "").trim().toUpperCase();

/* USER: ELIGIBILITY */
router.get("/withdraw-requests/eligibility", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    const pendingWithdraw = await WithdrawRequest.findOne({
      user: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (pendingWithdraw) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          hasRunningTurnover: false,
          hasPendingWithdraw: true,
          pendingWithdrawId: pendingWithdraw._id,
          remaining: 0,
          message:
            "You already have a pending withdraw request. Please wait until it is approved or rejected.",
        },
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (!running) {
      return res.json({
        success: true,
        data: {
          eligible: true,
          hasRunningTurnover: false,
          hasPendingWithdraw: false,
          remaining: 0,
          message: "",
        },
      });
    }

    const remaining = Math.max(
      0,
      Number(running.required || 0) - Number(running.progress || 0),
    );

    return res.json({
      success: true,
      data: {
        eligible: false,
        hasRunningTurnover: true,
        hasPendingWithdraw: false,
        remaining,
        message:
          remaining > 0
            ? `Turnover pending: remaining ${remaining}`
            : "Turnover pending",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/* USER: CREATE WITHDRAW REQUEST */
router.post("/withdraw-requests", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const methodId = normalizeMethodId(req.body?.methodId);
    const walletId = String(req.body?.walletId || "").trim();
    const amount = Number(req.body?.amount || 0);
    const otp = clean(req.body?.otp);

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
      });
    }

    const pendingWithdraw = await WithdrawRequest.findOne({
      user: userId,
      status: "pending",
    });

    if (pendingWithdraw) {
      return res.status(409).json({
        success: false,
        code: "PENDING_WITHDRAW_EXISTS",
        message:
          "You already have a pending withdraw request. Please wait until it is approved or rejected.",
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    });

    if (running) {
      const remaining = Math.max(
        0,
        Number(running.required || 0) - Number(running.progress || 0),
      );

      return res.status(403).json({
        success: false,
        message: "Turnover not fulfilled. Complete turnover before withdraw.",
        data: { remaining },
      });
    }

    const method = await WithdrawMethod.findOne({
      methodId,
      isActive: true,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found or inactive",
      });
    }

    const minAmount = Number(method.minimumWithdrawAmount || 0);
    const maxAmount = Number(method.maximumWithdrawAmount || 0);

    if (minAmount > 0 && amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdraw amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdraw amount is ${maxAmount}`,
      });
    }

    const wallet = await EWallet.findOne({
      _id: walletId,
      user: userId,
      isActive: true,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (otpSetting.withdrawEnabled) {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const otpResult = checkUserOtp(userId, otp);

      if (!otpResult.ok) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
        });
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const balanceBefore = Number(user.balance || 0);

    if (balanceBefore < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const balanceAfter = balanceBefore - amount;

    const created = await WithdrawRequest.create({
      user: user._id,
      methodId,
      wallet: wallet._id,
      walletSnapshot: {
        methodId: method.methodId,
        methodName: {
          bn: method?.name?.bn || "",
          en: method?.name?.en || "",
        },
        walletType: wallet.walletType || "",
        walletNumber: wallet.walletNumber || "",
        label: wallet.label || "",
      },
      amount,
      status: "pending",
      balanceBefore,
      balanceAfter,
    });

    await User.updateOne(
      { _id: user._id },
      { $set: { balance: balanceAfter } },
    );

    if (otpSetting.withdrawEnabled) {
      consumeUserOtp(userId);
    }

    return res.json({
      success: true,
      message: "Withdraw request created successfully",
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* USER: MY WITHDRAW HISTORY */
router.get("/withdraw-requests/my", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments({ user: userId }),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load history",
    });
  }
});

/* ADMIN: LIST WITHDRAW REQUESTS */
router.get("/admin/withdraw-requests", protectAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || "pending").trim();
    const qText = String(req.query.q || "").trim();

    const q = {};

    if (status && status !== "all") {
      q.status = status;
    }

    if (qText) {
      const users = await User.find({
        $or: [
          { userId: { $regex: qText, $options: "i" } },
          { phone: { $regex: qText, $options: "i" } },
          { email: { $regex: qText, $options: "i" } },
        ],
      }).select("_id");

      const ids = users.map((u) => u._id);

      q.user = {
        $in: ids.length ? ids : [new mongoose.Types.ObjectId()],
      };
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find(q)
        .populate("user", "userId phone email balance role isActive")
        .populate(
          "wallet",
          "methodId walletType walletNumber label isDefault isActive",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load requests",
    });
  }
});

/* ADMIN: SINGLE WITHDRAW REQUEST DETAILS */
router.get("/admin/withdraw-requests/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw request id",
      });
    }

    const doc = await WithdrawRequest.findById(id)
      .populate("user", "userId phone email balance role isActive")
      .populate(
        "wallet",
        "methodId walletType walletNumber label isDefault isActive",
      );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Withdraw request not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load withdraw request",
    });
  }
});

/* ADMIN: SINGLE USER WITHDRAW HISTORY */
router.get(
  "/admin/users/:userId/withdraw-history",
  protectAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit || 15)));
      const skip = (page - 1) * limit;

      const status = String(req.query.status || "all").trim().toLowerCase();
      const search = String(req.query.search || "").trim();

      const q = { user: userId };

      if (status && status !== "all") {
        q.status = status;
      }

      if (search) {
        q.$or = [
          { methodId: { $regex: search, $options: "i" } },
          { "walletSnapshot.methodId": { $regex: search, $options: "i" } },
          { "walletSnapshot.methodName.bn": { $regex: search, $options: "i" } },
          { "walletSnapshot.methodName.en": { $regex: search, $options: "i" } },
          { "walletSnapshot.walletType": { $regex: search, $options: "i" } },
          { "walletSnapshot.walletNumber": { $regex: search, $options: "i" } },
        ];
      }

      const [summaryRows, items, total] = await Promise.all([
        WithdrawRequest.aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              amount: { $sum: "$amount" },
            },
          },
        ]),

        WithdrawRequest.find(q)
          .populate("user", "userId phone email balance role isActive")
          .populate(
            "wallet",
            "methodId walletType walletNumber label isDefault isActive",
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        WithdrawRequest.countDocuments(q),
      ]);

      const summary = {
        total: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
        approved: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
      };

      summaryRows.forEach((row) => {
        const key = String(row?._id || "pending").toLowerCase();
        const count = Number(row?.count || 0);
        const amount = Number(row?.amount || 0);

        summary.total.count += count;
        summary.total.amount += amount;

        if (summary[key]) {
          summary[key].count = count;
          summary[key].amount = amount;
        }
      });

      return res.json({
        success: true,
        data: items,
        summary,
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
        message: "Failed to load user withdraw history",
      });
    }
  },
);

/* ADMIN: APPROVE */
router.patch(
  "/admin/withdraw-requests/:id/approve",
  protectAdmin,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};
      const doc = await WithdrawRequest.findById(req.params.id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Not found",
        });
      }

      if (doc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be approved",
        });
      }

      doc.status = "approved";
      doc.approvedAt = new Date();
      doc.rejectedAt = null;
      doc.adminNote = adminNote || "";
      doc.adminId = req.admin?._id || null;

      await doc.save();

      return res.json({
        success: true,
        message: "Approved successfully",
        data: doc,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Approve failed",
      });
    }
  },
);

/* ADMIN: REJECT + REFUND */
router.patch(
  "/admin/withdraw-requests/:id/reject",
  protectAdmin,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};
      const doc = await WithdrawRequest.findById(req.params.id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Not found",
        });
      }

      if (doc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending can be rejected",
        });
      }

      await User.updateOne(
        { _id: doc.user },
        { $inc: { balance: Number(doc.amount || 0) } },
      );

      doc.status = "rejected";
      doc.rejectedAt = new Date();
      doc.approvedAt = null;
      doc.adminNote = adminNote || "";
      doc.adminId = req.admin?._id || null;

      await doc.save();

      return res.json({
        success: true,
        message: "Rejected successfully and balance refunded",
        data: doc,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Reject failed",
      });
    }
  },
);

export default router;