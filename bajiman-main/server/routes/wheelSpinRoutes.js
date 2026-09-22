import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import WheelReward from "../models/WheelReward.js";
import WheelSpinHistory from "../models/WheelSpinHistory.js";
import TurnOver from "../models/TurnOver.js";

import protectUser from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

import {
  calculateDepositEligibility,
  calculateGameLossEligibility,
  calculateTurnoverEligibility,
} from "../services/rewardEligibilityService.js";

const router = express.Router();

// Public winner list must not expose real usernames — shows a stable
// pseudo-random display name (same winner always gets the same name, so
// it doesn't flicker across refreshes/pagination) plus the last 4 digits
// of their registered phone, e.g. "Rahim ****4521".
const WINNER_DISPLAY_NAME_POOL = [
  "Rahim", "Karim", "Jamal", "Kamal", "Rafiq", "Shakil", "Nasir", "Habib",
  "Anis", "Faruk", "Mizan", "Sohel", "Rubel", "Jewel", "Milon", "Babul",
  "Hasan", "Hossain", "Alamin", "Shamim", "Rakib", "Riyad", "Tanvir",
  "Sagor", "Emon", "Rana", "Rony", "Tuhin", "Rafi", "Nayan", "Sultana",
  "Nasrin", "Rina", "Shirin", "Moushumi", "Nazma", "Ruma", "Shathi",
  "Poly", "Munni",
];

const hashSeedToIndex = (seed, length) => {
  const str = String(seed || "");
  let hash = 0;

  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }

  return hash % length;
};

const buildWinnerDisplayName = (userId, phone) => {
  const name =
    WINNER_DISPLAY_NAME_POOL[
      hashSeedToIndex(userId, WINNER_DISPLAY_NAME_POOL.length)
    ];

  const last4 = String(phone || "")
    .replace(/\D/g, "")
    .slice(-4);

  return last4 ? `${name} ****${last4}` : name;
};

/* ======================================================
   OPTIONAL AUTH
   Wheel listing/details/winners must be visible to guests too.
   Attaches req.user when a valid token is present, otherwise
   continues as a guest (no 401).
====================================================== */

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    req.user = user ? { id: user._id, role: user.role } : null;
  } catch {
    req.user = null;
  }

  next();
};

/* ======================================================
   HELPERS
====================================================== */

const money = (value = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.round(number * 100) / 100;
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createRouteError = (message, statusCode = 400, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  Object.assign(error, extra);

  return error;
};

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

/* ======================================================
   PROBABILITY VALIDATION
====================================================== */

const validateWheelProbability = (segments = []) => {
  const activeSegments = segments
    .filter((segment) => segment.isActive !== false)
    .sort((a, b) => a.position - b.position);

  if (segments.length !== 8) {
    throw createRouteError("Wheel must contain exactly 8 segments");
  }

  if (activeSegments.length === 0) {
    throw createRouteError("Wheel has no active segments");
  }

  const totalProbability = activeSegments.reduce(
    (total, segment) => total + Number(segment.probability || 0),
    0,
  );

  if (Math.abs(totalProbability - 100) > 0.001) {
    throw createRouteError(
      `Active segment probability must be 100%. Current total: ${totalProbability}%`,
    );
  }

  return activeSegments;
};

/* ======================================================
   SECURE WEIGHTED PRIZE SELECTION
====================================================== */

const selectWeightedSegment = (segments = []) => {
  const activeSegments = validateWheelProbability(segments);

  /**
   * 0 থেকে 99,999,999 পর্যন্ত secure random।
   * Math.random() ব্যবহার করা হচ্ছে না।
   */
  const randomInteger = crypto.randomInt(0, 100_000_000);

  const randomPercentage = (randomInteger / 100_000_000) * 100;

  let cumulativeProbability = 0;

  for (const segment of activeSegments) {
    cumulativeProbability += Number(segment.probability || 0);

    if (randomPercentage < cumulativeProbability) {
      return segment;
    }
  }

  return activeSegments[activeSegments.length - 1];
};

/* ======================================================
   USER WHEEL ELIGIBILITY
====================================================== */

const getWheelEligibility = async ({ user, wheel }) => {
  const conditions = wheel.conditions || {};

  const minimumDeposit = Number(conditions.minimumDeposit || 0);

  const minimumTurnover = Number(conditions.minimumTurnover || 0);

  const minimumGameLoss = Number(conditions.minimumGameLoss || 0);

  const [depositResult, turnoverResult, gameLossResult] = await Promise.all([
    minimumDeposit > 0
      ? calculateDepositEligibility({ user })
      : Promise.resolve({ achievedAmount: 0 }),

    minimumTurnover > 0
      ? calculateTurnoverEligibility({ user })
      : Promise.resolve({ achievedAmount: 0 }),

    minimumGameLoss > 0
      ? calculateGameLossEligibility({ user })
      : Promise.resolve({ achievedAmount: 0 }),
  ]);

  const achievedDeposit = money(depositResult.achievedAmount);

  const achievedTurnover = money(turnoverResult.achievedAmount);

  const achievedGameLoss = money(gameLossResult.achievedAmount);

  const eligible =
    achievedDeposit >= minimumDeposit &&
    achievedTurnover >= minimumTurnover &&
    achievedGameLoss >= minimumGameLoss;

  return {
    eligible,

    requirements: {
      minimumDeposit,
      minimumTurnover,
      minimumGameLoss,
    },

    achieved: {
      deposit: achievedDeposit,
      turnover: achievedTurnover,
      gameLoss: achievedGameLoss,
    },
  };
};

/* ======================================================
   SPIN LIMIT VALIDATION
====================================================== */

const validateSpinLimits = async ({ userId, wheel }) => {
  const conditions = wheel.conditions || {};

  const dailySpinLimit = Number(conditions.dailySpinLimit || 0);

  const totalSpinLimit = Number(conditions.totalSpinLimit || 0);

  const cooldownMinutes = Number(conditions.cooldownMinutes || 0);

  const baseFilter = {
    user: userId,
    wheel: wheel._id,
    status: "completed",
  };

  const [dailyCount, totalCount, lastSpin] = await Promise.all([
    dailySpinLimit > 0
      ? WheelSpinHistory.countDocuments({
          ...baseFilter,

          spunAt: {
            $gte: getStartOfDay(),
            $lte: getEndOfDay(),
          },
        })
      : Promise.resolve(0),

    totalSpinLimit > 0
      ? WheelSpinHistory.countDocuments(baseFilter)
      : Promise.resolve(0),

    cooldownMinutes > 0
      ? WheelSpinHistory.findOne(baseFilter)
          .sort({
            spunAt: -1,
          })
          .lean()
      : Promise.resolve(null),
  ]);

  if (dailySpinLimit > 0 && dailyCount >= dailySpinLimit) {
    throw createRouteError("Daily Spin limit reached", 429);
  }

  if (totalSpinLimit > 0 && totalCount >= totalSpinLimit) {
    throw createRouteError("Total Spin limit reached", 429);
  }

  if (cooldownMinutes > 0 && lastSpin?.spunAt) {
    const nextSpinAt = new Date(
      new Date(lastSpin.spunAt).getTime() + cooldownMinutes * 60 * 1000,
    );

    if (new Date() < nextSpinAt) {
      const remainingSeconds = Math.ceil(
        (nextSpinAt.getTime() - Date.now()) / 1000,
      );

      throw createRouteError("Please wait before spinning again", 429, {
        nextSpinAt,
        remainingSeconds,
      });
    }
  }

  return {
    dailyCount,
    totalCount,
  };
};

/* ======================================================
   CLIENT: GET ALL ACTIVE WHEELS (public preview + guest safe)
   GET /api/wheels
====================================================== */

router.get("/wheels", optionalAuth, async (req, res) => {
  try {
    const now = new Date();

    const wheels = await WheelReward.find({
      isActive: true,

      $and: [
        {
          $or: [{ startAt: null }, { startAt: { $lte: now } }],
        },
        {
          $or: [{ endAt: null }, { endAt: { $gte: now } }],
        },
      ],
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    let userWallet = null;

    if (req.user?.id) {
      const user = await User.findById(req.user.id)
        .select("_id balance rewardCoin currency isActive")
        .lean();

      if (user) {
        userWallet = {
          balance: Number(user.balance || 0),
          rewardCoin: Number(user.rewardCoin || 0),
          currency: user.currency || "BDT",
        };
      }
    }

    res.json({
      success: true,
      wheels,
      user: userWallet,
      isAuthenticated: Boolean(req.user?.id),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   CLIENT: MY SPIN HISTORY
   GET /api/wheels/my/history
====================================================== */

router.get("/wheels/my/history", protectUser, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    if (["processing", "completed", "failed"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (["balance", "reward_coin", "no_prize"].includes(req.query.prizeType)) {
      filter["prizeSnapshot.prizeType"] = req.query.prizeType;
    }

    const [history, total] = await Promise.all([
      WheelSpinHistory.find(filter)
        .populate("wheel", "wheelImage title spinCost isActive")
        .populate(
          "turnover",
          "required progress status creditedAmount completedAt",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      WheelSpinHistory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      history,

      pagination: {
        page,
        limit,
        total,

        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   CLIENT: WINNER LIST (public)
   GET /api/wheels/winners?limit=30
====================================================== */

router.get("/wheels/winners", async (req, res) => {
  try {
    const parsedLimit = Number.parseInt(req.query.limit || "30", 10);

    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 30, 1),
      100,
    );

    const winners = await WheelSpinHistory.find({
      status: "completed",

      "prizeSnapshot.prizeType": {
        $in: ["balance", "reward_coin"],
      },

      "prizeSnapshot.amount": {
        $gt: 0,
      },
    })
      .populate({
        path: "user",
        select: "phone",
      })
      .populate({
        path: "wheel",
        select: "title wheelImage backgroundImage",
      })
      .sort({
        spunAt: -1,
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    const formattedWinners = winners.map((item) => ({
      _id: item._id,

      username: buildWinnerDisplayName(item.user?._id, item.user?.phone),

      wheel: item.wheel || null,

      selectedPosition: item.selectedPosition,

      prizeSnapshot: {
        text: {
          bn: item.prizeSnapshot?.text?.bn || "",

          en: item.prizeSnapshot?.text?.en || "",
        },

        prizeType: item.prizeSnapshot?.prizeType || "no_prize",

        amount: Number(item.prizeSnapshot?.amount || 0),
      },

      spunAt: item.spunAt || item.createdAt,
    }));

    return res.status(200).json({
      success: true,
      winners: formattedWinners,
    });
  } catch (error) {
    console.error("Get Wheel winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load Winner list",
      error: error.message,
    });
  }
});

/* ======================================================
   CLIENT: GET SINGLE WHEEL (public preview + guest safe)
   GET /api/wheels/:id
====================================================== */

router.get("/wheels/:id", optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel id",
      });
    }

    const wheel = await WheelReward.findById(req.params.id);

    if (!wheel || !wheel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found or inactive",
      });
    }

    let eligibility = null;
    let userWallet = null;

    if (req.user?.id) {
      const user = await User.findById(req.user.id);

      if (user) {
        eligibility = await getWheelEligibility({ user, wheel });

        userWallet = {
          balance: Number(user.balance || 0),
          rewardCoin: Number(user.rewardCoin || 0),
          currency: user.currency || "BDT",
        };
      }
    }

    res.json({
      success: true,
      wheel,
      eligibility,
      user: userWallet,
      isAuthenticated: Boolean(req.user?.id),
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

/* ======================================================
   CLIENT: SECURE SPIN (requires login)
   POST /api/wheels/:id/spin

   Body:
   {
     "requestId": "unique-client-request-id"
   }
====================================================== */

router.post("/wheels/:id/spin", protectUser, async (req, res) => {
  const userId = req.user.id;

  const wheelId = req.params.id;

  const requestId = String(req.body?.requestId || "").trim();

  let spinHistory = null;
  let turnover = null;

  let walletUpdated = false;

  let rewardCoinChange = 0;
  let balanceChange = 0;

  try {
    if (!mongoose.Types.ObjectId.isValid(wheelId)) {
      throw createRouteError("Invalid Wheel id", 400);
    }

    if (!requestId) {
      throw createRouteError("requestId is required", 400);
    }

    if (requestId.length > 100) {
      throw createRouteError("requestId is too long", 400);
    }

    const existingSpin = await WheelSpinHistory.findOne({
      spinId: requestId,
      user: userId,
    }).lean();

    if (existingSpin?.status === "completed") {
      return res.json({
        success: true,
        duplicate: true,

        selectedPosition: existingSpin.selectedPosition,

        prize: existingSpin.prizeSnapshot,

        user: {
          balance: existingSpin.balanceAfter,

          rewardCoin: existingSpin.rewardCoinAfter,
        },

        turnoverRequired: existingSpin.turnoverRequired,

        spinId: existingSpin.spinId,
      });
    }

    if (existingSpin?.status === "processing") {
      throw createRouteError("This Spin request is currently processing", 409);
    }

    if (existingSpin) {
      throw createRouteError("Spin request already used", 409);
    }

    const wheel = await WheelReward.findById(wheelId);

    if (!wheel) {
      throw createRouteError("Wheel not found", 404);
    }

    if (!wheel.isActive) {
      throw createRouteError("Wheel is currently inactive", 403);
    }

    const now = new Date();

    if (wheel.startAt && now < new Date(wheel.startAt)) {
      throw createRouteError("Wheel campaign has not started yet", 403);
    }

    if (wheel.endAt && now > new Date(wheel.endAt)) {
      throw createRouteError("Wheel campaign has expired", 403);
    }

    validateWheelProbability(wheel.segments);

    const user = await User.findById(userId);

    if (!user) {
      throw createRouteError("User not found", 404);
    }

    if (!user.isActive) {
      throw createRouteError("User account is inactive", 403);
    }

    const spinCost = money(wheel.spinCost);

    if (Number(user.rewardCoin || 0) < spinCost) {
      throw createRouteError("Insufficient Reward Coin", 400, {
        requiredRewardCoin: spinCost,

        currentRewardCoin: Number(user.rewardCoin || 0),
      });
    }

    const eligibility = await getWheelEligibility({ user, wheel });

    if (!eligibility.eligible) {
      throw createRouteError(
        "Wheel eligibility requirements are not completed",
        403,
        {
          eligibility,
        },
      );
    }

    await validateSpinLimits({
      userId: user._id,
      wheel,
    });

    const selectedSegment = selectWeightedSegment(wheel.segments);

    const prizeAmount = money(selectedSegment.amount);

    const prizeType = selectedSegment.prizeType;

    const balancePrize = prizeType === "balance" ? prizeAmount : 0;

    const rewardCoinPrize = prizeType === "reward_coin" ? prizeAmount : 0;

    const turnoverMultiplier =
      prizeType === "balance" ? money(selectedSegment.turnoverMultiplier) : 0;

    const turnoverRequired = money(balancePrize * turnoverMultiplier);

    rewardCoinChange = money(rewardCoinPrize - spinCost);

    balanceChange = balancePrize;

    const provisionalRewardCoinBefore = money(user.rewardCoin);

    const provisionalRewardCoinAfter = money(
      provisionalRewardCoinBefore + rewardCoinChange,
    );

    const provisionalBalanceBefore = money(user.balance);

    const provisionalBalanceAfter = money(
      provisionalBalanceBefore + balanceChange,
    );

    try {
      spinHistory = await WheelSpinHistory.create({
        spinId: requestId,

        user: user._id,
        wheel: wheel._id,

        selectedPosition: selectedSegment.position,

        wheelSnapshot: {
          wheelImage: wheel.wheelImage,

          title: {
            bn: wheel.title?.bn || "",

            en: wheel.title?.en || "",
          },

          spinCost,
        },

        prizeSnapshot: {
          position: selectedSegment.position,

          text: {
            bn: selectedSegment.text?.bn || "",

            en: selectedSegment.text?.en || "",
          },

          prizeType,
          amount: prizeAmount,

          probability: Number(selectedSegment.probability || 0),

          turnoverMultiplier,

          backgroundColor: selectedSegment.backgroundColor || "#ffc800",

          textColor: selectedSegment.textColor || "#000000",
        },

        rewardCoinBefore: provisionalRewardCoinBefore,

        spinCost,
        rewardCoinPrize,

        rewardCoinAfter: provisionalRewardCoinAfter,

        balanceBefore: provisionalBalanceBefore,

        balancePrize,

        balanceAfter: provisionalBalanceAfter,

        turnoverMultiplier,
        turnoverRequired,

        turnover: null,

        status: "processing",

        failureReason: "",

        spunAt: now,
      });
    } catch (historyError) {
      if (historyError?.code === 11000) {
        throw createRouteError("Spin request already processed", 409);
      }

      throw historyError;
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,

        rewardCoin: {
          $gte: spinCost,
        },
      },
      {
        $inc: {
          rewardCoin: rewardCoinChange,

          balance: balanceChange,
        },
      },
      {
        returnDocument: "after",

        runValidators: true,
      },
    );

    if (!updatedUser) {
      throw createRouteError(
        "Insufficient Reward Coin or Spin request failed",
        400,
      );
    }

    walletUpdated = true;

    const rewardCoinAfter = money(updatedUser.rewardCoin);

    const rewardCoinBefore = money(rewardCoinAfter - rewardCoinChange);

    const balanceAfter = money(updatedUser.balance);

    const balanceBefore = money(balanceAfter - balanceChange);

    if (turnoverRequired > 0) {
      turnover = await TurnOver.create({
        user: user._id,

        sourceType: "redeem",

        sourceId: spinHistory._id,

        required: turnoverRequired,

        progress: 0,

        status: "running",

        creditedAmount: balancePrize,

        completedAt: null,
      });

      spinHistory.turnover = turnover._id;
    }

    spinHistory.rewardCoinBefore = rewardCoinBefore;

    spinHistory.rewardCoinAfter = rewardCoinAfter;

    spinHistory.balanceBefore = balanceBefore;

    spinHistory.balanceAfter = balanceAfter;

    spinHistory.status = "completed";

    spinHistory.failureReason = "";

    await spinHistory.save();

    return res.status(200).json({
      success: true,

      message:
        prizeType === "no_prize"
          ? "Spin completed"
          : "Congratulations! You won a prize.",

      spinId: spinHistory.spinId,

      selectedPosition: selectedSegment.position,

      prize: {
        position: selectedSegment.position,

        text: selectedSegment.text,

        prizeType,

        amount: prizeAmount,

        turnoverMultiplier,

        backgroundColor: selectedSegment.backgroundColor,

        textColor: selectedSegment.textColor,
      },

      cost: {
        rewardCoin: spinCost,
      },

      user: {
        balanceBefore,

        balance: balanceAfter,

        rewardCoinBefore,

        rewardCoin: rewardCoinAfter,

        currency: updatedUser.currency || "BDT",
      },

      turnover: turnover
        ? {
            _id: turnover._id,

            required: turnover.required,

            progress: turnover.progress,

            status: turnover.status,

            sourceType: turnover.sourceType,
          }
        : null,

      turnoverRequired,
    });
  } catch (error) {
    console.error("Secure Wheel Spin error:", error);

    let rollbackSuccessful = true;

    if (turnover?._id) {
      try {
        await TurnOver.deleteOne({
          _id: turnover._id,
        });
      } catch (turnoverRollbackError) {
        rollbackSuccessful = false;

        console.error("Wheel Turnover rollback failed:", turnoverRollbackError);
      }
    }

    if (walletUpdated) {
      try {
        const rollbackUser = await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              rewardCoin: -rewardCoinChange,

              balance: -balanceChange,
            },
          },
          {
            returnDocument: "after",
          },
        );

        if (!rollbackUser) {
          rollbackSuccessful = false;
        }
      } catch (walletRollbackError) {
        rollbackSuccessful = false;

        console.error("Wheel wallet rollback failed:", walletRollbackError);
      }
    }

    if (spinHistory?._id) {
      try {
        if (rollbackSuccessful) {
          await WheelSpinHistory.deleteOne({
            _id: spinHistory._id,

            status: "processing",
          });
        } else {
          await WheelSpinHistory.findByIdAndUpdate(
            spinHistory._id,
            {
              status: "failed",

              failureReason: error.message || "Spin failed",
            },
            {
              returnDocument: "after",
            },
          );
        }
      } catch (historyRollbackError) {
        console.error("Wheel history rollback failed:", historyRollbackError);
      }
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Spin request already processed",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,

      message: error.message || "Wheel Spin failed",

      ...(error.eligibility
        ? {
            eligibility: error.eligibility,
          }
        : {}),

      ...(error.requiredRewardCoin !== undefined
        ? {
            requiredRewardCoin: error.requiredRewardCoin,

            currentRewardCoin: error.currentRewardCoin,
          }
        : {}),

      ...(error.nextSpinAt
        ? {
            nextSpinAt: error.nextSpinAt,

            remainingSeconds: error.remainingSeconds,
          }
        : {}),

      ...(!rollbackSuccessful
        ? {
            requiresManualReview: true,

            rollbackMessage:
              "Some Spin changes could not be rolled back automatically",
          }
        : {}),
    });
  }
});

/* ======================================================
   ADMIN: ALL SPIN HISTORY
   GET /api/admin/wheel-spin-history
====================================================== */

router.get("/admin/wheel-spin-history", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();

    const filter = {};

    if (["processing", "completed", "failed"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (["balance", "reward_coin", "no_prize"].includes(req.query.prizeType)) {
      filter["prizeSnapshot.prizeType"] = req.query.prizeType;
    }

    if (mongoose.Types.ObjectId.isValid(req.query.wheelId)) {
      filter.wheel = new mongoose.Types.ObjectId(req.query.wheelId);
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};

      if (req.query.startDate) {
        filter.createdAt.$gte = getStartOfDay(req.query.startDate);
      }

      if (req.query.endDate) {
        filter.createdAt.$lte = getEndOfDay(req.query.endDate);
      }
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const matchingUsers = await User.find({
        $or: [
          {
            username: regex,
          },
          {
            phone: regex,
          },
          {
            email: regex,
          },
          {
            userId: regex,
          },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((user) => user._id);

      filter.$or = [
        {
          spinId: regex,
        },
        {
          "wheelSnapshot.title.bn": regex,
        },
        {
          "wheelSnapshot.title.en": regex,
        },
        {
          "prizeSnapshot.text.bn": regex,
        },
        {
          "prizeSnapshot.text.en": regex,
        },

        ...(userIds.length > 0
          ? [
              {
                user: {
                  $in: userIds,
                },
              },
            ]
          : []),
      ];
    }

    const [history, total, summaryResult] = await Promise.all([
      WheelSpinHistory.find(filter)
        .populate("user", "username userId phone email currency role")
        .populate("wheel", "title wheelImage spinCost isActive")
        .populate(
          "turnover",
          "required progress status creditedAmount completedAt",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      WheelSpinHistory.countDocuments(filter),

      WheelSpinHistory.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,

            totalSpins: {
              $sum: 1,
            },

            totalCoinSpent: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "completed"],
                  },
                  "$spinCost",
                  0,
                ],
              },
            },

            totalBalancePrize: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "completed"],
                  },
                  "$balancePrize",
                  0,
                ],
              },
            },

            totalRewardCoinPrize: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "completed"],
                  },
                  "$rewardCoinPrize",
                  0,
                ],
              },
            },

            uniqueUsers: {
              $addToSet: "$user",
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalSpins: 1,
            totalCoinSpent: 1,
            totalBalancePrize: 1,
            totalRewardCoinPrize: 1,

            uniqueUsers: {
              $size: "$uniqueUsers",
            },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      history,

      summary: summaryResult[0] || {
        totalSpins: 0,
        totalCoinSpent: 0,
        totalBalancePrize: 0,
        totalRewardCoinPrize: 0,
        uniqueUsers: 0,
      },

      pagination: {
        page,
        limit,
        total,

        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    console.error("Admin Wheel history error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
