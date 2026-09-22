import express from "express";
import User from "../models/User.js";
import DepositRequest from "../models/DepositRequest.js";
import AutoDeposit from "../models/AutoDeposit.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import Game from "../models/Game.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const num = (value = 0) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const sumField = async (Model, match = {}, field = "amount") => {
  const result = await Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: `$${field}` },
      },
    },
  ]);

  return num(result?.[0]?.total);
};

// Accepts "YYYY-MM-DD" (from the calendar) and returns that day's
// [start, end] bounds in server-local time; defaults to today when no
// valid date is given.
const dayRange = (dateStr) => {
  const parsed = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    0,
    0,
    0,
    0,
  );

  const end = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    23,
    59,
    59,
    999,
  );

  return { start, end, dateStr: start.toISOString().slice(0, 10) };
};

router.get("/summary", protectAdmin, async (req, res) => {
  try {
    const [
      allUsers,
      activeUsers,
      allAffiliateUsers,
      allGames,
      activeGames,

      pendingDepositRequest,
      pendingManualDepositAmount,
      approvedManualDepositAmount,

      pendingAutoDepositCount,
      approvedAutoDepositAmount,

      pendingWithdrawRequest,
      approvedWithdrawAmount,

      latestUsers,
      latestDeposits,
      latestAutoDeposits,
      latestWithdraws,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      User.countDocuments({ role: "aff-user" }),

      Game.countDocuments({}),
      Game.countDocuments({ status: "active" }),

      DepositRequest.countDocuments({ status: "pending" }),
      sumField(DepositRequest, { status: "pending" }, "amount"),
      sumField(DepositRequest, { status: "approved" }, "amount"),

      AutoDeposit.countDocuments({ status: "PENDING" }),
      sumField(AutoDeposit, { status: "PAID" }, "amount"),

      WithdrawRequest.countDocuments({ status: "pending" }),
      sumField(WithdrawRequest, { status: "approved" }, "amount"),

      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId phone role isActive balance createdAt")
        .lean(),

      DepositRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "userId phone")
        .select("user amount status createdAt")
        .lean(),

      AutoDeposit.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userIdentity amount status invoiceNumber createdAt")
        .lean(),

      WithdrawRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "userId phone")
        .select("user amount status createdAt")
        .lean(),
    ]);

    const allDepositBalances =
      approvedManualDepositAmount + approvedAutoDepositAmount;

    const totalUsersForChart = allUsers;
    const inactiveUsers = Math.max(totalUsersForChart - activeUsers, 0);

    return successResponse(res, "Dashboard summary loaded", {
      cards: {
        allUsers,
        activeUsers,
        allAffiliateUsers,
        allDepositBalances,
        allGames,
        activeGames,
        allWithdrawBalances: approvedWithdrawAmount,
        pendingDepositRequest: pendingDepositRequest + pendingAutoDepositCount,
        pendingWithdrawRequest,
      },

      chart: {
        users: {
          active: activeUsers,
          inactive: inactiveUsers,
        },
        requests: {
          pendingDeposit: pendingDepositRequest + pendingAutoDepositCount,
          pendingWithdraw: pendingWithdrawRequest,
          approvedDepositAmount: allDepositBalances,
          approvedWithdrawAmount,
        },
      },

      latest: {
        users: latestUsers,
        deposits: [...latestDeposits, ...latestAutoDeposits]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        withdraws: latestWithdraws,
      },

      totals: {
        pendingManualDepositAmount,
        approvedManualDepositAmount,
        approvedAutoDepositAmount,
        approvedWithdrawAmount,
      },
    });
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    return errorResponse(
      res,
      error.message || "Failed to load dashboard summary",
      500,
    );
  }
});

/* Same 8 cards as /summary, but scoped to one calendar day (defaults to
   today). ?date=YYYY-MM-DD lets the dashboard's calendar re-fetch any
   past day's figures instead of always showing today's. */
router.get("/today", protectAdmin, async (req, res) => {
  try {
    const { start, end, dateStr } = dayRange(req.query.date);
    const createdAt = { $gte: start, $lte: end };

    const [
      allUsers,
      activeUsers,
      allAffiliateUsers,
      allGames,
      activeGames,

      pendingDepositRequest,
      approvedManualDepositAmount,

      pendingAutoDepositCount,
      approvedAutoDepositAmount,

      pendingWithdrawRequest,
      approvedWithdrawAmount,
    ] = await Promise.all([
      User.countDocuments({ role: "user", createdAt }),
      User.countDocuments({ role: "user", isActive: true, createdAt }),
      User.countDocuments({ role: "aff-user", createdAt }),

      Game.countDocuments({ createdAt }),
      Game.countDocuments({ status: "active", createdAt }),

      DepositRequest.countDocuments({ status: "pending", createdAt }),
      sumField(DepositRequest, { status: "approved", createdAt }, "amount"),

      AutoDeposit.countDocuments({ status: "PENDING", createdAt }),
      sumField(AutoDeposit, { status: "PAID", createdAt }, "amount"),

      WithdrawRequest.countDocuments({ status: "pending", createdAt }),
      sumField(WithdrawRequest, { status: "approved", createdAt }, "amount"),
    ]);

    const allDepositBalances =
      approvedManualDepositAmount + approvedAutoDepositAmount;

    return successResponse(res, "Dashboard today summary loaded", {
      date: dateStr,
      cards: {
        allUsers,
        activeUsers,
        allAffiliateUsers,
        allDepositBalances,
        allGames,
        activeGames,
        allWithdrawBalances: approvedWithdrawAmount,
        pendingDepositRequest: pendingDepositRequest + pendingAutoDepositCount,
        pendingWithdrawRequest,
      },
    });
  } catch (error) {
    console.error("DASHBOARD TODAY ERROR:", error);
    return errorResponse(
      res,
      error.message || "Failed to load dashboard today summary",
      500,
    );
  }
});

export default router;
