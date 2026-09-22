import DepositRequest from "../models/DepositRequest.js";
import GameHistory from "../models/GameHistory.js";

const sumAggregate = async (Model, match, sumExpression) => {
  const result = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: sumExpression } } },
  ]);

  return result[0]?.total || 0;
};

/**
 * Lifetime approved deposit total for a user.
 */
export const calculateDepositEligibility = async ({ user }) => {
  const achievedAmount = await sumAggregate(
    DepositRequest,
    { user: user._id, status: "approved" },
    "$amount",
  );

  return { achievedAmount };
};

/**
 * Lifetime wagering volume (turnover) for a user, i.e. total bet_amount
 * across all game rounds.
 */
export const calculateTurnoverEligibility = async ({ user }) => {
  const achievedAmount = await sumAggregate(
    GameHistory,
    { user: user._id },
    "$bet_amount",
  );

  return { achievedAmount };
};

/**
 * Lifetime net game loss for a user.
 */
export const calculateGameLossEligibility = async ({ user }) => {
  const achievedAmount = await sumAggregate(
    GameHistory,
    { user: user._id, resultType: "loss" },
    { $abs: "$net_amount" },
  );

  return { achievedAmount };
};
