import express from "express";
import mongoose from "mongoose";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const safePage = (value = 1) => Math.max(1, Number(value) || 1);

const safeLimit = (value = 10) =>
  Math.min(100, Math.max(1, Number(value) || 10));

const buildSummary = async (filter = {}) => {
  const agg = await TurnOver.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalRequired: { $sum: "$required" },
        totalProgress: { $sum: "$progress" },
        totalCreditedAmount: { $sum: "$creditedAmount" },
        runningCount: {
          $sum: { $cond: [{ $eq: ["$status", "running"] }, 1, 0] },
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ]);

  const s = agg?.[0] || {};

  return {
    totalRequired: s.totalRequired || 0,
    totalProgress: s.totalProgress || 0,
    totalCreditedAmount: s.totalCreditedAmount || 0,
    runningCount: s.runningCount || 0,
    completedCount: s.completedCount || 0,
  };
};

/* ---------------- USER: MY TURNOVERS ---------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    if (status && ["running", "completed"].includes(status)) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      TurnOver.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
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

/* ---------------- ADMIN: LIST ALL TURNOVERS ---------------- */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();
    const sourceType = String(req.query.sourceType || "").trim();

    const filter = {};

    if (status && ["running", "completed"].includes(status)) {
      filter.status = status;
    }

    if (
      sourceType &&
      [
        "deposit",
        "auto-deposit",
        "auto-personal-deposit",
        "register-bonus",
        "admin-manual-deposit",
      ].includes(sourceType)
    ) {
      filter.sourceType = sourceType;
    }

    if (q) {
      const users = await User.find({
        $or: [
          { userId: { $regex: q, $options: "i" } },
          { userGamePlayName: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.user = {
        $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
      };
    }

    const [items, total, summary] = await Promise.all([
      TurnOver.find(filter)
        .populate(
          "user",
          "userId userGamePlayName phone email balance role isActive",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TurnOver.countDocuments(filter),

      buildSummary(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        ...summary,
        totalRecords: total,
        pageRecords: items.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: SINGLE USER TURNOVERS ---------------- */
router.get("/admin/user/:userId", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const sourceType = String(req.query.sourceType || "").trim();
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const filter = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (status && ["running", "completed"].includes(status)) {
      filter.status = status;
    }

    if (
      sourceType &&
      [
        "deposit",
        "auto-deposit",
        "auto-personal-deposit",
        "register-bonus",
        "admin-manual-deposit",
      ].includes(sourceType)
    ) {
      filter.sourceType = sourceType;
    }

    const [items, total, summary] = await Promise.all([
      TurnOver.find(filter)
        .populate(
          "user",
          "userId userGamePlayName phone email balance role isActive",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TurnOver.countDocuments(filter),

      buildSummary(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        ...summary,
        totalRecords: total,
        pageRecords: items.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: SINGLE TURNOVER DETAILS ---------------- */
router.get("/admin/:id", protectAdmin, async (req, res) => {
  try {
    const doc = await TurnOver.findById(req.params.id)
      .populate(
        "user",
        "userId userGamePlayName phone email balance role isActive",
      )
      .lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Turnover not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: UPDATE PROGRESS ---------------- */
router.post("/admin/:id/progress", protectAdmin, async (req, res) => {
  try {
    const add = safeNumber(req.body?.add, 0);

    if (!Number.isFinite(add) || add <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid add amount",
      });
    }

    const doc = await TurnOver.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Turnover not found",
      });
    }

    if (doc.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Already completed",
      });
    }

    doc.progress = Number(doc.progress || 0) + add;

    if (doc.progress >= Number(doc.required || 0)) {
      doc.progress = Number(doc.required || 0);
      doc.status = "completed";
      doc.completedAt = new Date();
    }

    await doc.save();

    return res.json({
      success: true,
      message: "Turnover progress updated successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

export default router;
