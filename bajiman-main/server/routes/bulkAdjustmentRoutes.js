import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { protectAdmin, requireMother } from "../middleware/protectAdmin.js";

const router = express.Router();

const n = (value = 0) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const makeFullName = (user) => {
  const firstName = String(user?.firstName || "").trim();
  const lastName = String(user?.lastName || "").trim();

  return `${firstName} ${lastName}`.trim() || "No Name";
};

const buildSearchMatch = (q = "") => {
  const query = String(q || "").trim();

  const match = {
    role: "aff-user",
  };

  if (query) {
    match.$or = [
      { userId: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { countryCode: { $regex: query, $options: "i" } },
    ];
  }

  return match;
};

const getAdjustmentPreview = (user) => {
  const gameLoss = n(user?.gameLossCommissionBalance);
  const deposit = n(user?.depositCommissionBalance);
  const refer = n(user?.referCommissionBalance);
  const gameWin = n(user?.gameWinCommissionBalance);

  const gross = gameLoss + deposit + refer;
  const net = gross - gameWin;

  return {
    gameLoss,
    deposit,
    refer,
    gameWin,
    gross,
    net,
  };
};

/**
 * ADMIN: Affiliate users list for bulk adjustment
 * GET /api/admin/bulk-adjustment/users?page=1&limit=10&q=search
 */
router.get(
  "/admin/bulk-adjustment/users",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);

      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10", 10), 1),
        50,
      );

      const skip = (page - 1) * limit;
      const q = String(req.query.q || "").trim();

      const match = buildSearchMatch(q);

      const [users, total] = await Promise.all([
        User.find(match)
          .select(
            `
            userId
            email
            countryCode
            phone
            firstName
            lastName
            role
            isActive
            currency
            balance
            commissionBalance
            gameLossCommission
            depositCommission
            referCommission
            gameWinCommission
            gameLossCommissionBalance
            depositCommissionBalance
            referCommissionBalance
            gameWinCommissionBalance
            referralCode
            referralCount
            createdAt
          `,
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        User.countDocuments(match),
      ]);

      const data = users.map((user) => {
        const preview = getAdjustmentPreview(user);

        return {
          _id: user._id,
          userId: user.userId,
          email: user.email || "",
          countryCode: user.countryCode || "",
          phone: user.phone || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          fullName: makeFullName(user),

          role: user.role,
          isActive: user.isActive,
          currency: user.currency || "BDT",

          balance: n(user.balance),
          commissionBalance: n(user.commissionBalance),

          gameLossCommission: n(user.gameLossCommission),
          depositCommission: n(user.depositCommission),
          referCommission: n(user.referCommission),
          gameWinCommission: n(user.gameWinCommission),

          gameLossCommissionBalance: preview.gameLoss,
          depositCommissionBalance: preview.deposit,
          referCommissionBalance: preview.refer,
          gameWinCommissionBalance: preview.gameWin,

          gross: preview.gross,
          net: preview.net,

          referralCode: user.referralCode || "",
          referralCount: n(user.referralCount),

          createdAt: user.createdAt,
        };
      });

      return res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    } catch (error) {
      console.error("bulk-adjustment users error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: Adjust single affiliate user
 * POST /api/admin/bulk-adjustment/adjust/:userId
 */
router.post(
  "/admin/bulk-adjustment/adjust/:userId",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      const user = await User.findOne({
        _id: userId,
        role: "aff-user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Affiliate user not found",
        });
      }

      const preview = getAdjustmentPreview(user);

      if (preview.gross === 0 && preview.gameWin === 0) {
        return res.status(400).json({
          success: false,
          message: "No commission balance available for adjustment",
        });
      }

      user.balance = n(user.balance) + preview.net;

      user.commissionBalance = 0;
      user.gameLossCommissionBalance = 0;
      user.depositCommissionBalance = 0;
      user.referCommissionBalance = 0;
      user.gameWinCommissionBalance = 0;

      await user.save();

      return res.json({
        success: true,
        message: "Bulk adjustment completed successfully",
        data: {
          userId: user._id,
          affiliateUserId: user.userId,
          gross: preview.gross,
          net: preview.net,
          balance: n(user.balance),
        },
      });
    } catch (error) {
      console.error("bulk-adjustment single error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: Adjust all affiliate users
 * POST /api/admin/bulk-adjustment/adjust-all
 * body: { q?: "search text" }
 */
router.post(
  "/admin/bulk-adjustment/adjust-all",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const q = String(req.body?.q || "").trim();

      const match = buildSearchMatch(q);

      const users = await User.find(match).select(
        `
        userId
        role
        balance
        commissionBalance
        gameLossCommissionBalance
        depositCommissionBalance
        referCommissionBalance
        gameWinCommissionBalance
      `,
      );

      let adjustedUsers = 0;
      let skippedUsers = 0;
      let totalGross = 0;
      let totalNet = 0;

      const ops = [];

      for (const user of users) {
        const preview = getAdjustmentPreview(user);

        if (preview.gross === 0 && preview.gameWin === 0) {
          skippedUsers += 1;
          continue;
        }

        adjustedUsers += 1;
        totalGross += preview.gross;
        totalNet += preview.net;

        ops.push({
          updateOne: {
            filter: {
              _id: user._id,
              role: "aff-user",
            },
            update: {
              $inc: {
                balance: preview.net,
              },
              $set: {
                commissionBalance: 0,
                gameLossCommissionBalance: 0,
                depositCommissionBalance: 0,
                referCommissionBalance: 0,
                gameWinCommissionBalance: 0,
              },
            },
          },
        });
      }

      if (ops.length > 0) {
        await User.bulkWrite(ops, {
          ordered: false,
        });
      }

      return res.json({
        success: true,
        message: "Bulk adjustment completed successfully",
        data: {
          adjustedUsers,
          skippedUsers,
          totalGross,
          totalNet,
        },
      });
    } catch (error) {
      console.error("bulk-adjustment all error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

export default router;
