import express from "express";
import mongoose from "mongoose";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js";
import AffWithdrawRequest from "../models/AffWithdrawRequest.js";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { protectAdmin, requireMother } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const n = (value = 0) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const fullName = (user) => {
  const first = String(user?.firstName || "").trim();
  const last = String(user?.lastName || "").trim();
  return `${first} ${last}`.trim() || "No Name";
};

const hasPendingBulkAdjustment = (user) => {
  const total =
    n(user?.gameLossCommissionBalance) +
    n(user?.depositCommissionBalance) +
    n(user?.referCommissionBalance) +
    n(user?.gameWinCommissionBalance);

  return total > 0;
};

const validateSubmittedFields = (method, fields = {}) => {
  const errors = [];

  for (const f of method?.fields || []) {
    const value = String(fields?.[f.key] ?? "").trim();

    if (f.required !== false && !value) {
      errors.push(`${f.key} is required`);
      continue;
    }

    if (!value) continue;

    if (f.type === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) errors.push(`${f.key} must be a valid email`);
    }

    if (f.type === "number") {
      const num = Number(value);
      if (!Number.isFinite(num)) errors.push(`${f.key} must be numeric`);
    }

    if (f.type === "tel") {
      const bdOk = /^01[3-9]\d{8}$/.test(value);
      if (value.startsWith("01") && value.length >= 11 && !bdOk) {
        errors.push(`${f.key} must be a valid Bangladeshi phone number`);
      }
    }
  }

  return errors;
};

const REQUIRED_ACTIVE_REFERRALS = 5;

const getReferralEligibility = async (affUser) => {
  const activeReferralCount = await User.countDocuments({
    referredBy: affUser._id,
    role: "user",
    isActive: true,
  });

  const remainingReferralCount = Math.max(
    REQUIRED_ACTIVE_REFERRALS - activeReferralCount,
    0,
  );

  return {
    eligible: activeReferralCount >= REQUIRED_ACTIVE_REFERRALS,
    required: REQUIRED_ACTIVE_REFERRALS,
    activeReferralCount,
    depositedReferralCount: activeReferralCount,
    remainingReferralCount,
    message:
      activeReferralCount >= REQUIRED_ACTIVE_REFERRALS
        ? "Referral requirement completed."
        : `You need ${remainingReferralCount} more active referred user(s).`,
  };
};

/**
 * AFFILIATE: eligibility
 * GET /api/aff-withdraw-requests/eligibility
 */
router.get(
  "/aff-withdraw-requests/eligibility",
  protectUser,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).lean();

      if (!user || user.role !== "aff-user") {
        return errorResponse(res, "Only affiliate users can withdraw", 403);
      }

      const referralEligibility = await getReferralEligibility(user);

      if (!referralEligibility.eligible) {
        return successResponse(res, "Eligibility checked", {
          eligible: false,
          remaining: 0,
          ...referralEligibility,
        });
      }

      if (hasPendingBulkAdjustment(user)) {
        return successResponse(res, "Eligibility checked", {
          eligible: false,
          remaining: 0,
          ...referralEligibility,
          message:
            "Bulk Adjustment first required. Please complete bulk adjustment before withdrawal.",
        });
      }

      const pending = await AffWithdrawRequest.countDocuments({
        user: user._id,
        status: "pending",
      });

      if (pending > 0) {
        return successResponse(res, "Eligibility checked", {
          eligible: false,
          remaining: n(user.balance),
          ...referralEligibility,
          message: "You already have a pending withdraw request.",
        });
      }

      if (n(user.balance) <= 0) {
        return successResponse(res, "Eligibility checked", {
          eligible: false,
          remaining: 0,
          ...referralEligibility,
          message: "Insufficient withdrawable balance.",
        });
      }

      return successResponse(res, "Eligible", {
        eligible: true,
        remaining: n(user.balance),
        ...referralEligibility,
        message: "Eligible",
      });
    } catch (error) {
      console.error("aff withdraw eligibility error:", error);
      return errorResponse(res, "Server error", 500);
    }
  },
);

/**
 * AFFILIATE: create request
 * POST /api/aff-withdraw-requests
 */
router.post("/aff-withdraw-requests", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "aff-user") {
      return errorResponse(res, "Only affiliate users can withdraw", 403);
    }

    const referralEligibility = await getReferralEligibility(user);

    if (!referralEligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: referralEligibility.message,
        data: referralEligibility,
      });
    }

    if (hasPendingBulkAdjustment(user)) {
      return errorResponse(
        res,
        "Bulk Adjustment first required before withdraw.",
        400,
      );
    }

    const pending = await AffWithdrawRequest.findOne({
      user: user._id,
      status: "pending",
    });

    if (pending) {
      return errorResponse(
        res,
        "You already have a pending withdraw request.",
        400,
      );
    }

    const methodId = String(req.body?.methodId || "")
      .trim()
      .toUpperCase();
    const amount = Number(req.body?.amount || 0);
    const fields = req.body?.fields || {};

    if (!methodId) {
      return errorResponse(res, "Method ID is required", 400);
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse(res, "Valid amount is required", 400);
    }

    const method = await AffWithdrawMethod.findOne({
      methodId,
      isActive: true,
    }).lean();

    if (!method) {
      return errorResponse(res, "Withdraw method not found", 404);
    }

    const min = n(method.minimumWithdrawAmount);
    const max = n(method.maximumWithdrawAmount);

    if (amount < min) {
      return errorResponse(res, `Minimum withdraw amount is ${min}`, 400);
    }

    if (max > 0 && amount > max) {
      return errorResponse(res, `Maximum withdraw amount is ${max}`, 400);
    }

    if (amount > n(user.balance)) {
      return errorResponse(res, "Insufficient balance", 400);
    }

    const fieldErrors = validateSubmittedFields(method, fields);

    if (fieldErrors.length) {
      return res.status(400).json({
        success: false,
        message: fieldErrors[0],
        errors: fieldErrors,
      });
    }

    const balanceBefore = n(user.balance);
    const balanceAfter = balanceBefore - amount;

    user.balance = balanceAfter;
    await user.save();

    const request = await AffWithdrawRequest.create({
      user: user._id,
      methodId,
      amount,
      fields,
      status: "pending",
      balanceBefore,
      balanceAfter,
    });

    return successResponse(
      res,
      "Withdraw request submitted successfully",
      request,
      201,
    );
  } catch (error) {
    console.error("aff withdraw create error:", error);
    return errorResponse(res, "Server error", 500);
  }
});

/**
 * AFFILIATE: my list
 * GET /api/aff-withdraw-requests/my
 */
router.get("/aff-withdraw-requests/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "all").trim();

    const match = { user: req.user.id };

    if (["pending", "approved", "rejected"].includes(status)) {
      match.status = status;
    }

    const [rows, total] = await Promise.all([
      AffWithdrawRequest.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AffWithdrawRequest.countDocuments(match),
    ]);

    return res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("aff withdraw my list error:", error);
    return errorResponse(res, "Server error", 500);
  }
});

/**
 * AFFILIATE: my details
 * GET /api/aff-withdraw-requests/my/:id
 */
router.get("/aff-withdraw-requests/my/:id", protectUser, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid request id", 400);
    }

    const row = await AffWithdrawRequest.findOne({
      _id: id,
      user: req.user.id,
    }).lean();

    if (!row) {
      return errorResponse(res, "Withdraw request not found", 404);
    }

    return successResponse(res, "Withdraw request details", row);
  } catch (error) {
    console.error("aff withdraw my details error:", error);
    return errorResponse(res, "Server error", 500);
  }
});

/**
 * ADMIN: list
 * GET /api/admin/aff-withdraw-requests
 */
router.get(
  "/admin/aff-withdraw-requests",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10", 10), 1),
        100,
      );
      const skip = (page - 1) * limit;

      const q = String(req.query.q || "").trim();
      const status = String(req.query.status || "all").trim();

      const match = {};

      if (["pending", "approved", "rejected"].includes(status)) {
        match.status = status;
      }

      if (q) {
        const users = await User.find({
          role: "aff-user",
          $or: [
            { userId: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
          ],
        }).select("_id");

        const userIds = users.map((user) => user._id);

        match.$or = [
          {
            user: {
              $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
            },
          },
          { methodId: { $regex: q, $options: "i" } },
        ];
      }

      const [rows, total] = await Promise.all([
        AffWithdrawRequest.find(match)
          .populate(
            "user",
            "userId phone email firstName lastName balance currency",
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        AffWithdrawRequest.countDocuments(match),
      ]);

      const data = rows.map((row) => ({
        ...row,
        user: row.user
          ? {
              ...row.user,
              fullName: fullName(row.user),
            }
          : null,
      }));

      return res.json({
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
        },
      });
    } catch (error) {
      console.error("admin aff withdraw list error:", error);
      return errorResponse(res, "Server error", 500);
    }
  },
);

/**
 * ADMIN: details
 * GET /api/admin/aff-withdraw-requests/:id
 */
router.get(
  "/admin/aff-withdraw-requests/:id",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse(res, "Invalid request id", 400);
      }

      const row = await AffWithdrawRequest.findById(id)
        .populate(
          "user",
          "userId phone email firstName lastName balance currency",
        )
        .lean();

      if (!row) {
        return errorResponse(res, "Withdraw request not found", 404);
      }

      return successResponse(res, "Withdraw request details", {
        ...row,
        user: row.user
          ? {
              ...row.user,
              fullName: fullName(row.user),
            }
          : null,
      });
    } catch (error) {
      console.error("admin aff withdraw details error:", error);
      return errorResponse(res, "Server error", 500);
    }
  },
);

/**
 * ADMIN: approve
 * PATCH /api/admin/aff-withdraw-requests/:id/approve
 */
router.patch(
  "/admin/aff-withdraw-requests/:id/approve",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse(res, "Invalid request id", 400);
      }

      const adminNote = String(req.body?.adminNote || "").trim();

      const row = await AffWithdrawRequest.findById(id);

      if (!row) {
        return errorResponse(res, "Withdraw request not found", 404);
      }

      if (row.status !== "pending") {
        return errorResponse(res, "Only pending requests can be approved", 400);
      }

      row.status = "approved";
      row.adminId = req.admin?._id || null;
      row.adminNote = adminNote;
      row.approvedAt = new Date();

      await row.save();

      return successResponse(
        res,
        "Affiliate withdraw approved successfully",
        row,
      );
    } catch (error) {
      console.error("admin aff withdraw approve error:", error);
      return errorResponse(res, "Server error", 500);
    }
  },
);

/**
 * ADMIN: reject
 * PATCH /api/admin/aff-withdraw-requests/:id/reject
 */
router.patch(
  "/admin/aff-withdraw-requests/:id/reject",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse(res, "Invalid request id", 400);
      }

      const adminNote = String(req.body?.adminNote || "").trim();

      const row = await AffWithdrawRequest.findById(id);

      if (!row) {
        return errorResponse(res, "Withdraw request not found", 404);
      }

      if (row.status !== "pending") {
        return errorResponse(res, "Only pending requests can be rejected", 400);
      }

      const user = await User.findById(row.user);

      if (!user) {
        return errorResponse(res, "Affiliate user not found", 404);
      }

      user.balance = n(user.balance) + n(row.amount);
      await user.save();

      row.status = "rejected";
      row.adminId = req.admin?._id || null;
      row.adminNote = adminNote;
      row.rejectedAt = new Date();
      row.balanceAfter = n(user.balance);

      await row.save();

      return successResponse(
        res,
        "Affiliate withdraw rejected successfully",
        row,
      );
    } catch (error) {
      console.error("admin aff withdraw reject error:", error);
      return errorResponse(res, "Server error", 500);
    }
  },
);

export default router;
