import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import CheckInRewardSetting from "../models/CheckInRewardSetting.js";
import UserCheckInProgress from "../models/UserCheckInProgress.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

const CHECK_IN_WAIT_TIME = 24 * 60 * 60 * 1000;

/* ======================================================
   HELPERS
====================================================== */

const buildFileUrl = (req, value = "") => {
  if (!value) return "";
  if (String(value).startsWith("http")) return value;

  const clean = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${clean}`;
};

const formatRewards = (req, rewards = []) =>
  Array.isArray(rewards)
    ? rewards.map((reward) => ({
        rewardType: reward.rewardType,
        amount: reward.amount,
        icon: reward.icon || "",
        iconUrl: reward.icon ? buildFileUrl(req, reward.icon) : "",
      }))
    : [];

const createError = (message, statusCode = 400, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  Object.assign(error, extra);

  return error;
};

const getRemainingTime = (nextClaimAt) => {
  if (!nextClaimAt) {
    return {
      remainingMilliseconds: 0,
      remainingSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const difference = Math.max(new Date(nextClaimAt).getTime() - Date.now(), 0);

  const remainingSeconds = Math.ceil(difference / 1000);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    remainingMilliseconds: difference,
    remainingSeconds,
    hours,
    minutes,
    seconds,
  };
};

const sortDays = (days = []) => {
  return [...days].sort((a, b) => a.dayNumber - b.dayNumber);
};

const resetProgressForNewVersion = async ({ progress, setting }) => {
  const firstDayNumber = sortDays(setting.days)?.[0]?.dayNumber || 1;

  progress.setting = setting._id;
  progress.settingVersion = setting.version || 1;
  progress.nextDayNumber = firstDayNumber;
  progress.lastClaimedDayNumber = 0;
  progress.lastClaimAt = null;
  progress.nextClaimAt = null;
  progress.completedCycles = 0;
  progress.lastRewards = [];

  await progress.save();

  return progress;
};

/* ======================================================
   PUBLIC: CHECK-IN PREVIEW (no login required)
   GET /api/check-in-reward/public
====================================================== */

router.get("/check-in-reward/public", async (req, res) => {
  try {
    const setting = await CheckInRewardSetting.findOne({
      settingKey: "global",
    });

    if (!setting) {
      return res.json({
        success: true,
        setting: null,
        days: [],
      });
    }

    const sortedDays = sortDays(setting.days);

    const days = sortedDays.map((day, index) => ({
      _id: day._id,
      dayNumber: day.dayNumber,
      dayName: day.dayName,
      rewards: formatRewards(req, day.rewards),
      status: index === 0 ? "available" : "locked",
      isCurrent: index === 0,
      canClaim: false,
    }));

    return res.json({
      success: true,

      setting: {
        _id: setting._id,
        title: setting.title,
        description: setting.description,
        isActive: setting.isActive,
        version: setting.version,
      },

      days,
    });
  } catch (err) {
    console.error("Get public Check-In status error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   CLIENT: GET CHECK-IN STATUS
   GET /api/check-in-reward
====================================================== */

router.get("/check-in-reward", protectUser, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const [user, setting] = await Promise.all([
      User.findById(userId)
        .select("_id username balance rewardCoin currency isActive")
        .lean(),

      CheckInRewardSetting.findOne({
        settingKey: "global",
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Check-In reward has not been created yet",
      });
    }

    const sortedDays = sortDays(setting.days);

    if (sortedDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Check-In reward days configured",
      });
    }

    let progress = await UserCheckInProgress.findOne({
      user: userId,
    });

    /*
     * Admin setting update হলে version পরিবর্তন হবে।
     * তখন user আবার Day 1 থেকে শুরু করবে।
     */
    if (
      progress &&
      Number(progress.settingVersion) !== Number(setting.version)
    ) {
      progress = await resetProgressForNewVersion({
        progress,
        setting,
      });
    }

    const firstDayNumber = sortedDays[0].dayNumber;

    const currentDayNumber = progress?.nextDayNumber || firstDayNumber;

    const currentDay =
      sortedDays.find((day) => day.dayNumber === currentDayNumber) ||
      sortedDays[0];

    const nextClaimAt = progress?.nextClaimAt || null;
    const now = new Date();

    const waitingForNextClaim = nextClaimAt && now < new Date(nextClaimAt);

    const canClaim = setting.isActive && !waitingForNextClaim;

    const remainingTime = getRemainingTime(nextClaimAt);

    const days = sortedDays.map((day) => {
      let dayStatus = "locked";

      if (day.dayNumber < currentDay.dayNumber) {
        dayStatus = "claimed";
      }

      if (day.dayNumber === currentDay.dayNumber) {
        dayStatus = canClaim ? "available" : "waiting";
      }

      return {
        _id: day._id,
        dayNumber: day.dayNumber,
        dayName: day.dayName,
        rewards: formatRewards(req, day.rewards),
        status: dayStatus,
        isCurrent: day.dayNumber === currentDay.dayNumber,
        canClaim: day.dayNumber === currentDay.dayNumber && canClaim,
      };
    });

    return res.json({
      success: true,

      setting: {
        _id: setting._id,
        title: setting.title,
        description: setting.description,
        isActive: setting.isActive,
        version: setting.version,
      },

      days,

      progress: {
        currentDayNumber: currentDay.dayNumber,
        lastClaimedDayNumber: progress?.lastClaimedDayNumber || 0,
        completedCycles: progress?.completedCycles || 0,
        lastClaimAt: progress?.lastClaimAt || null,
        nextClaimAt,
        canClaim,
        remainingTime,
      },

      user: {
        balance: Number(user.balance || 0),
        rewardCoin: Number(user.rewardCoin || 0),
        currency: user.currency || "BDT",
      },
    });
  } catch (err) {
    console.error("Get Check-In status error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   CLIENT: CLAIM CHECK-IN REWARD
   POST /api/check-in-reward/claim
====================================================== */

router.post("/check-in-reward/claim", protectUser, async (req, res) => {
  let reservedProgress = null;
  let previousProgress = null;
  let creditedUserId = null;
  let creditedIncrement = null;

  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const [setting, user] = await Promise.all([
      CheckInRewardSetting.findOne({
        settingKey: "global",
      }),

      User.findById(userId).select(
        "_id username balance rewardCoin currency isActive",
      ),
    ]);

    if (!setting) {
      throw createError("Check-In reward has not been created yet", 404);
    }

    if (!setting.isActive) {
      throw createError("Check-In reward is currently inactive", 403);
    }

    if (!user) {
      throw createError("User not found", 404);
    }

    if (!user.isActive) {
      throw createError("User account is inactive", 403);
    }

    const sortedDays = sortDays(setting.days);

    if (sortedDays.length === 0) {
      throw createError("No Check-In reward days configured");
    }

    /*
     * Progress না থাকলে তৈরি করব।
     * এখানে user-এর progress model-এ unique index থাকা উচিত।
     */
    try {
      await UserCheckInProgress.updateOne(
        {
          user: user._id,
        },
        {
          $setOnInsert: {
            user: user._id,
            setting: setting._id,
            settingVersion: setting.version || 1,
            nextDayNumber: sortedDays[0].dayNumber,
            lastClaimedDayNumber: 0,
            lastClaimAt: null,
            nextClaimAt: null,
            completedCycles: 0,
            lastRewards: [],
          },
        },
        {
          upsert: true,
        },
      );
    } catch (error) {
      /*
       * Concurrent request-এর কারণে duplicate key হলে
       * existing progress ব্যবহার করা হবে।
       */
      if (error?.code !== 11000) {
        throw error;
      }
    }

    let progress = await UserCheckInProgress.findOne({
      user: user._id,
    });

    if (!progress) {
      throw createError("Failed to create Check-In progress", 500);
    }

    /*
     * Admin setting update করলে নতুন version এলে
     * Day 1 থেকে শুরু হবে।
     */
    if (Number(progress.settingVersion) !== Number(setting.version)) {
      progress = await resetProgressForNewVersion({
        progress,
        setting,
      });
    }

    const now = new Date();

    if (progress.nextClaimAt && now < new Date(progress.nextClaimAt)) {
      throw createError(
        "You must wait 24 hours before the next Check-In",
        429,
        {
          nextClaimAt: progress.nextClaimAt,
          remainingTime: getRemainingTime(progress.nextClaimAt),
        },
      );
    }

    let currentDayIndex = sortedDays.findIndex(
      (day) => day.dayNumber === progress.nextDayNumber,
    );

    if (currentDayIndex < 0) {
      currentDayIndex = 0;
    }

    const currentDay = sortedDays[currentDayIndex];
    const rewards = Array.isArray(currentDay.rewards) ? currentDay.rewards : [];

    if (rewards.length === 0) {
      throw createError("No reward configured for this day");
    }

    let balanceIncrement = 0;
    let rewardCoinIncrement = 0;

    rewards.forEach((reward) => {
      const amount = Number(reward.amount || 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw createError("Invalid Check-In reward amount");
      }

      if (reward.rewardType === "balance") {
        balanceIncrement += amount;
      } else if (reward.rewardType === "reward_coin") {
        rewardCoinIncrement += amount;
      } else {
        throw createError("Invalid Check-In reward type");
      }
    });

    const isLastDay = currentDayIndex === sortedDays.length - 1;

    const nextDay = isLastDay ? sortedDays[0] : sortedDays[currentDayIndex + 1];

    const nextClaimAt = new Date(now.getTime() + CHECK_IN_WAIT_TIME);

    const previousNextClaimAt = progress.nextClaimAt || null;

    const lastRewardsSnapshot = rewards.map((reward) => ({
      rewardType: reward.rewardType,
      amount: Number(reward.amount || 0),
    }));

    previousProgress = {
      setting: progress.setting,
      settingVersion: progress.settingVersion,
      nextDayNumber: progress.nextDayNumber,
      lastClaimedDayNumber: progress.lastClaimedDayNumber,
      lastClaimAt: progress.lastClaimAt,
      nextClaimAt: progress.nextClaimAt,
      completedCycles: progress.completedCycles || 0,
      lastRewards: progress.lastRewards || [],
    };

    /*
     * এই atomic update একই সময়ে দুইটি claim সফল হওয়া
     * প্রতিরোধ করবে। প্রথম request progress reserve করবে।
     */
    const progressFilter = {
      _id: progress._id,
      user: user._id,
      settingVersion: setting.version || 1,
      nextDayNumber: currentDay.dayNumber,
    };

    if (previousNextClaimAt) {
      progressFilter.nextClaimAt = previousNextClaimAt;
    } else {
      progressFilter.$or = [
        { nextClaimAt: null },
        { nextClaimAt: { $exists: false } },
      ];
    }

    reservedProgress = await UserCheckInProgress.findOneAndUpdate(
      progressFilter,
      {
        $set: {
          setting: setting._id,
          settingVersion: setting.version || 1,
          lastClaimedDayNumber: currentDay.dayNumber,
          nextDayNumber: nextDay.dayNumber,
          lastClaimAt: now,
          nextClaimAt,
          lastRewards: lastRewardsSnapshot,
        },

        ...(isLastDay ? { $inc: { completedCycles: 1 } } : {}),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!reservedProgress) {
      const latestProgress = await UserCheckInProgress.findOne({
        user: user._id,
      }).lean();

      throw createError(
        "Check-In already claimed or another claim is being processed",
        409,
        {
          nextClaimAt: latestProgress?.nextClaimAt || null,
          remainingTime: getRemainingTime(latestProgress?.nextClaimAt),
        },
      );
    }

    const balanceBefore = Number(user.balance || 0);
    const rewardCoinBefore = Number(user.rewardCoin || 0);

    const increment = {};
    if (balanceIncrement > 0) increment.balance = balanceIncrement;
    if (rewardCoinIncrement > 0) increment.rewardCoin = rewardCoinIncrement;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: increment },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) {
      throw createError("Failed to credit Check-In reward", 500);
    }

    creditedUserId = user._id;
    creditedIncrement = increment;

    return res.status(200).json({
      success: true,

      message: "Check-In reward claimed successfully",

      claimedDay: {
        dayNumber: currentDay.dayNumber,
        dayName: currentDay.dayName,
        rewards: formatRewards(req, rewards),
      },

      nextDay: {
        dayNumber: nextDay.dayNumber,
        dayName: nextDay.dayName,
      },

      progress: {
        lastClaimedDayNumber: currentDay.dayNumber,
        nextDayNumber: nextDay.dayNumber,
        completedCycles: reservedProgress.completedCycles || 0,
        lastClaimAt: now,
        nextClaimAt,
        canClaim: false,
        remainingTime: getRemainingTime(nextClaimAt),
      },

      user: {
        balanceBefore,
        balanceAfter: Number(updatedUser.balance || 0),
        rewardCoinBefore,
        rewardCoinAfter: Number(updatedUser.rewardCoin || 0),
        currency: updatedUser.currency || "BDT",
      },
    });
  } catch (err) {
    console.error("Check-In claim error:", err);

    /*
     * Progress reserve হওয়ার পর credit ব্যর্থ হলে
     * আগের progress ফিরিয়ে দেওয়া হবে।
     */
    if (reservedProgress && previousProgress && !creditedUserId) {
      try {
        await UserCheckInProgress.updateOne(
          {
            _id: reservedProgress._id,
            lastClaimAt: reservedProgress.lastClaimAt,
            nextClaimAt: reservedProgress.nextClaimAt,
          },
          { $set: previousProgress },
        );
      } catch (rollbackError) {
        console.error("Check-In progress rollback error:", rollbackError);
      }
    }

    /*
     * Credit হওয়ার পর অপ্রত্যাশিত error হলে
     * credited amount reverse করার চেষ্টা করব।
     */
    if (creditedUserId && creditedIncrement) {
      try {
        const reverseFilter = { _id: creditedUserId };
        const reverseInc = {};

        if (creditedIncrement.balance) {
          reverseFilter.balance = { $gte: creditedIncrement.balance };
          reverseInc.balance = -creditedIncrement.balance;
        }

        if (creditedIncrement.rewardCoin) {
          reverseFilter.rewardCoin = { $gte: creditedIncrement.rewardCoin };
          reverseInc.rewardCoin = -creditedIncrement.rewardCoin;
        }

        if (Object.keys(reverseInc).length > 0) {
          await User.updateOne(reverseFilter, { $inc: reverseInc });
        }

        if (reservedProgress && previousProgress) {
          await UserCheckInProgress.updateOne(
            {
              _id: reservedProgress._id,
              lastClaimAt: reservedProgress.lastClaimAt,
              nextClaimAt: reservedProgress.nextClaimAt,
            },
            { $set: previousProgress },
          );
        }
      } catch (rollbackError) {
        console.error("Check-In credit rollback error:", rollbackError);
      }
    }

    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Check-In request already processed. Please try again.",
      });
    }

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to claim Check-In reward",

      ...(err.nextClaimAt ? { nextClaimAt: err.nextClaimAt } : {}),
      ...(err.remainingTime ? { remainingTime: err.remainingTime } : {}),
    });
  }
});

export default router;
