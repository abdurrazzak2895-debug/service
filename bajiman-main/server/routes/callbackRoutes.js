import express from "express";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";
import { resolveProviderCodeFromCatalog } from "../utils/gameProviderCatalog.js";

const router = express.Router();

const toNum = (value = 0) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value = 0) => {
  const n = toNum(value);
  return Math.trunc(n * 100) / 100;
};

const clean = (value = "") => String(value || "").trim();

const cleanMemberAccount = (value = "") => {
  let username = clean(value).toLowerCase();

  if (username.endsWith("orclegames")) {
    username = username.slice(0, -"orclegames".length);
  }

  if (username.endsWith("oraclegames")) {
    username = username.slice(0, -"oraclegames".length);
  }

  return username;
};

/* ----------------------------- TURNOVER PROGRESS -----------------------------
   Provider eligibility is decided PER TURNOVER, not site-wide — each
   TurnOver doc carries its own eligibleProviders, snapshotted at creation
   time from whichever deposit/bonus config generated it (manual deposit's
   DepositBonusTurnover, auto deposit's AutoDepositToken bonus, or a
   register bonus campaign). Empty = fully unrestricted for that turnover
   (any provider counts 1:1). Once a turnover has a non-empty list, each
   provider's percent is a MANDATORY MINIMUM SHARE of that turnover's
   required amount — e.g. 50%+50% across two providers splits the whole
   requirement into two dedicated caps, so wagering only on one provider
   can never finish it. Any leftover percent (100 - sum of configured
   percents) is an open pool any provider (including eligible ones, once
   their own cap is full) can fill. If the configured percents sum to
   100, there's no open pool and a non-eligible provider's wager counts
   for nothing on that turnover. */
const applyTurnoverProgress = async ({ userId, gameUId, wagerAmount }) => {
  const amt = money(wagerAmount);
  if (amt <= 0) return false;

  const turnovers = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({ createdAt: 1 });

  if (!turnovers.length) return false;

  // Only bother resolving the wagered game's provider (a catalog lookup)
  // if at least one running turnover actually restricts by provider.
  const anyRestricted = turnovers.some(
    (t) => Array.isArray(t.eligibleProviders) && t.eligibleProviders.length,
  );

  const providerCode = anyRestricted
    ? await resolveProviderCodeFromCatalog(gameUId)
    : null;

  let remaining = amt;
  let applied = false;

  for (const turnover of turnovers) {
    if (remaining <= 0) break;

    const required = money(turnover.required);
    const progress = money(turnover.progress);
    let left = Math.max(0, money(required - progress));

    if (left <= 0) {
      await TurnOver.updateOne(
        { _id: turnover._id },
        {
          $set: {
            progress: required,
            status: "completed",
            completedAt: new Date(),
          },
        },
      );
      continue;
    }

    const eligible = Array.isArray(turnover.eligibleProviders)
      ? turnover.eligibleProviders
      : [];

    const match =
      eligible.length && providerCode
        ? eligible.find(
            (item) => String(item.providerCode).toUpperCase() === providerCode,
          )
        : null;

    const sumPercent = eligible.length
      ? Math.min(
          100,
          eligible.reduce((sum, item) => sum + Number(item.percent || 0), 0),
        )
      : 0;

    const openPercent = eligible.length ? Math.max(0, 100 - sumPercent) : 100;

    let dedicatedAdd = 0;
    let openAdd = 0;

    if (!eligible.length) {
      openAdd = money(Math.min(left, remaining));
    } else if (!match && openPercent <= 0) {
      // Restricted, this provider isn't eligible, and there's no open
      // pool to fall back on — nothing to contribute to THIS turnover.
    } else {
      const providerProgressList = turnover.providerProgress || [];
      const sumProviderProgress = money(
        providerProgressList.reduce((s, p) => s + money(p.progress || 0), 0),
      );
      const currentOpenProgress = money(
        Math.max(0, progress - sumProviderProgress),
      );

      let pool = remaining;

      if (match) {
        const entry = providerProgressList.find(
          (p) => p.providerCode === providerCode,
        );
        const currentProviderProgress = money(entry?.progress || 0);
        const providerQuota = money((required * Number(match.percent || 0)) / 100);
        const providerRoom = Math.max(
          0,
          money(providerQuota - currentProviderProgress),
        );

        dedicatedAdd = money(Math.min(providerRoom, pool, left));
        pool = money(pool - dedicatedAdd);
        left = money(left - dedicatedAdd);
      }

      if (pool > 0 && openPercent > 0 && left > 0) {
        const openQuota = money((required * openPercent) / 100);
        const openRoom = Math.max(0, money(openQuota - currentOpenProgress));
        openAdd = money(Math.min(openRoom, pool, left));
      }
    }

    const add = money(dedicatedAdd + openAdd);

    if (add <= 0) continue;

    const newProgress = money(progress + add);
    const completed = newProgress >= required;

    const setFields = completed
      ? { status: "completed", completedAt: new Date() }
      : null;

    if (dedicatedAdd > 0 && providerCode) {
      const hasEntry = (turnover.providerProgress || []).some(
        (p) => p.providerCode === providerCode,
      );

      if (hasEntry) {
        await TurnOver.updateOne(
          { _id: turnover._id, "providerProgress.providerCode": providerCode },
          {
            $inc: { progress: add, "providerProgress.$.progress": dedicatedAdd },
            ...(setFields ? { $set: setFields } : {}),
          },
        );
      } else {
        await TurnOver.updateOne(
          { _id: turnover._id },
          {
            $inc: { progress: add },
            $push: { providerProgress: { providerCode, progress: dedicatedAdd } },
            ...(setFields ? { $set: setFields } : {}),
          },
        );
      }
    } else {
      await TurnOver.updateOne(
        { _id: turnover._id },
        {
          $inc: { progress: add },
          ...(setFields ? { $set: setFields } : {}),
        },
      );
    }

    applied = true;
    remaining = money(remaining - add);
  }

  return applied;
};

/* ----------------------------- AFFILIATE COMMISSION ----------------------------- */
const applyAffiliateCommission = async ({ player, netAmount }) => {
  const empty = {
    affiliateUser: null,
    affiliateCommissionApplied: false,
    affiliateCommissionAmount: 0,
    affiliateCommissionType: "none",
  };

  if (!player?.referredBy) return empty;

  const affiliate = await User.findOne({
    _id: player.referredBy,
    role: "aff-user",
    isActive: true,
  });

  if (!affiliate) return empty;

  let commissionAmount = 0;
  let commissionType = "none";

  if (netAmount < 0) {
    const lossAmount = Math.abs(netAmount);
    const percent = toNum(affiliate.gameLossCommission);

    if (percent > 0) {
      commissionAmount = money((lossAmount * percent) / 100);
      commissionType = "game-loss";

      affiliate.gameLossCommissionBalance = money(
        toNum(affiliate.gameLossCommissionBalance) + commissionAmount,
      );
    }
  }

  if (netAmount > 0) {
    const winAmount = netAmount;
    const percent = toNum(affiliate.gameWinCommission);

    if (percent > 0) {
      commissionAmount = money((winAmount * percent) / 100);
      commissionType = "game-win";

      affiliate.gameWinCommissionBalance = money(
        toNum(affiliate.gameWinCommissionBalance) + commissionAmount,
      );
    }
  }

  if (commissionAmount <= 0) {
    return {
      affiliateUser: affiliate._id,
      affiliateCommissionApplied: false,
      affiliateCommissionAmount: 0,
      affiliateCommissionType: "none",
    };
  }

  affiliate.commissionBalance = money(
    toNum(affiliate.commissionBalance) + commissionAmount,
  );

  await affiliate.save();

  return {
    affiliateUser: affiliate._id,
    affiliateCommissionApplied: true,
    affiliateCommissionAmount: commissionAmount,
    affiliateCommissionType: commissionType,
  };
};

/* ----------------------------- ORACLE CALLBACK ----------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      game_uid,
      game_round,
      bet_amount,
      serial_number,
      win_amount,
      member_account,
      currency_code,
      timestamp,
    } = req.body || {};

    if (
      !game_uid ||
      !game_round ||
      !serial_number ||
      bet_amount === undefined ||
      win_amount === undefined ||
      !member_account
    ) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Missing required fields",
      });
    }

    const gameUId = clean(game_uid);
    const gameRound = clean(game_round);
    const serialNumber = clean(serial_number);
    const rawMemberAccount = clean(member_account);
    const userGamePlayName = cleanMemberAccount(member_account);

    const betAmount = money(bet_amount);
    const winAmount = money(win_amount);

    if (betAmount < 0 || winAmount < 0) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Invalid amount",
      });
    }

    const duplicate = await GameHistory.findOne({
      serial_number: serialNumber,
    }).lean();

    if (duplicate) {
      return res.status(200).json({
        success: false,
        balance: duplicate.balance_after || 0,
        message: "DUPLICATE",
        data: {
          status: "DUPLICATE",
          balance: duplicate.balance_after || 0,
          game_round: gameRound,
          serial_number: serialNumber,
        },
      });
    }

    const player = await User.findOne({
      userGamePlayName,
      isActive: true,
    });

    if (!player) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "USER_NOT_FOUND",
        data: {
          member_account: rawMemberAccount,
          userGamePlayName,
        },
      });
    }

    const currentBalance = money(player.balance || 0);

    if (currentBalance < betAmount) {
      return res.status(200).json({
        success: false,
        balance: currentBalance,
        message: "INSUFFICIENT_BALANCE",
        data: {
          status: "INSUFFICIENT_BALANCE",
          currentBalance,
          betAmount,
          game_round: gameRound,
          serial_number: serialNumber,
        },
      });
    }

    const netAmount = money(winAmount - betAmount);

    let resultType = "push";
    if (netAmount > 0) resultType = "win";
    if (netAmount < 0) resultType = "loss";

    const newBalance = money(currentBalance - betAmount + winAmount);

    const updatedPlayer = await User.findByIdAndUpdate(
      player._id,
      { $set: { balance: newBalance } },
      { returnDocument: "after" },
    );

    const finalBalance = money(updatedPlayer?.balance || 0);

    const turnoverApplied =
      betAmount > 0
        ? await applyTurnoverProgress({
            userId: player._id,
            gameUId,
            wagerAmount: betAmount,
          })
        : false;

    const affiliateResult = await applyAffiliateCommission({
      player,
      netAmount,
    });

    const history = await GameHistory.create({
      user: player._id,
      userId: player.userId,
      userGamePlayName: player.userGamePlayName,
      member_account: rawMemberAccount,
      phone: `${player.countryCode || ""}${player.phone || ""}`,
      email: player.email || "",
      currency: currency_code || player.currency || "BDT",
      userRole: player.role || "user",

      game_uid: gameUId,
      game_round: gameRound,
      serial_number: serialNumber,

      bet_amount: betAmount,
      win_amount: winAmount,
      net_amount: netAmount,
      resultType,

      balance_before: currentBalance,
      balance_after: finalBalance,

      turnoverApplied,

      affiliateUser: affiliateResult.affiliateUser,
      affiliateCommissionApplied: affiliateResult.affiliateCommissionApplied,
      affiliateCommissionAmount: affiliateResult.affiliateCommissionAmount,
      affiliateCommissionType: affiliateResult.affiliateCommissionType,

      oracleTimestamp: clean(timestamp),
      rawPayload: req.body || {},
    });

    return res.status(200).json({
      success: true,
      balance: finalBalance,
      message: "SUCCESS",
      data: {
        status: "SUCCESS",
        resultType,
        betAmount,
        winAmount,
        netAmount,
        balanceBefore: currentBalance,
        newBalance: finalBalance,
        turnoverApplied,
        affiliateCommissionApplied: affiliateResult.affiliateCommissionApplied,
        affiliateCommissionAmount: affiliateResult.affiliateCommissionAmount,
        affiliateCommissionType: affiliateResult.affiliateCommissionType,
        game_round: gameRound,
        serial_number: serialNumber,
        historyId: history._id,
      },
    });
  } catch (error) {
    console.error("GAME CALLBACK ERROR:", error);

    if (error?.code === 11000) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "DUPLICATE",
        data: { status: "DUPLICATE" },
      });
    }

    return res.status(200).json({
      success: false,
      balance: 0,
      message: "Internal processing error, but acknowledged",
    });
  }
});

export { applyTurnoverProgress };
export default router;
