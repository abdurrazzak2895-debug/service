import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import GameHistory from "../models/GameHistory.js";
import User from "../models/User.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

const ORACLE_WEBSITE_BASE =
  process.env.ORACLE_WEBSITE_BASE || "https://oraclegames.net";

const safePage = (value = 1) => Math.max(1, Number(value) || 1);
const safeLimit = (value = 10) =>
  Math.min(100, Math.max(1, Number(value) || 10));

/**
 * oraclegames.net/all-games is a server-rendered (Inertia) page. The
 * initial HTML embeds the page props as JSON in a `data-page="..."`
 * attribute on the root element, HTML-entity encoded.
 */
const extractInertiaPageData = (html = "") => {
  const match = String(html).match(/data-page="([^"]*)"/);
  if (!match) return null;

  const raw = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * GameHistory only stores the raw `game_uid` string, not a game name.
 * `?search=<game_uid>` on the public Oracle Games site matches games by
 * game_uid directly, so the name can be resolved without first knowing
 * which provider the game belongs to.
 */
const fetchOracleGameNameByUid = async (gameUId) => {
  try {
    const res = await axios.get(`${ORACLE_WEBSITE_BASE}/all-games`, {
      params: { search: gameUId },
      timeout: 20000,
    });

    const pageData = extractInertiaPageData(res.data);
    const games = pageData?.props?.games?.data;

    if (!Array.isArray(games)) return "";

    const match = games.find(
      (game) => String(game?.game_uid || "").trim() === gameUId,
    );

    return match?.name || "";
  } catch (error) {
    console.log("ORACLE GAME NAME SEARCH ERROR:", gameUId, error.message);
    return "";
  }
};

const withGameNames = async (items) => {
  const gameUIds = [
    ...new Set(items.map((item) => item.game_uid).filter(Boolean)),
  ];

  if (!gameUIds.length) return items;

  const nameMap = new Map();

  await Promise.all(
    gameUIds.map(async (gameUId) => {
      const name = await fetchOracleGameNameByUid(gameUId);
      if (name) nameMap.set(gameUId, name);
    }),
  );

  return items.map((item) => ({
    ...item,
    game_name: nameMap.get(item.game_uid) || "",
  }));
};

/* ---------------- USER: MY BET HISTORY ---------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const resultType = String(req.query.resultType || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {
      user: req.user.id,
    };

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
    }

    if (q) {
      filter.$or = [
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      GameHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      GameHistory.countDocuments(filter),
    ]);

    const data = await withGameNames(items);

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
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: ALL BET HISTORY ---------------- */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const resultType = String(req.query.resultType || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
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

      filter.$or = [
        {
          user: {
            $in: userIds.length
              ? userIds
              : [new mongoose.Types.ObjectId()],
          },
        },
        { userId: { $regex: q, $options: "i" } },
        { userGamePlayName: { $regex: q, $options: "i" } },
        { member_account: { $regex: q, $options: "i" } },
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total, summaryAgg] = await Promise.all([
      GameHistory.find(filter)
        .populate(
          "user",
          "userId userGamePlayName phone email balance role isActive",
        )
        .populate("affiliateUser", "userId phone email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(filter),

      GameHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: "$bet_amount" },
            totalWinAmount: { $sum: "$win_amount" },
            totalNetAmount: { $sum: "$net_amount" },
            totalWinCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "win"] }, 1, 0] },
            },
            totalLossCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "loss"] }, 1, 0] },
            },
            totalPushCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "push"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {};
    const data = await withGameNames(items);

    return res.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        totalBetAmount: summary.totalBetAmount || 0,
        totalWinAmount: summary.totalWinAmount || 0,
        totalNetAmount: summary.totalNetAmount || 0,
        siteProfit: Number(summary.totalNetAmount || 0) * -1,
        totalTransactions: total,
        totalWinCount: summary.totalWinCount || 0,
        totalLossCount: summary.totalLossCount || 0,
        totalPushCount: summary.totalPushCount || 0,
        pageRecords: data.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: SINGLE USER BET HISTORY ---------------- */
router.get("/admin/user/:userId", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const resultType = String(req.query.resultType || "").trim();
    const { userId } = req.params;

    const filter = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
    }

    if (q) {
      filter.$or = [
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
        { member_account: { $regex: q, $options: "i" } },
        { userGamePlayName: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total, summaryAgg] = await Promise.all([
      GameHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(filter),

      GameHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: "$bet_amount" },
            totalWinAmount: { $sum: "$win_amount" },
            totalNetAmount: { $sum: "$net_amount" },
            totalWinCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "win"] }, 1, 0] },
            },
            totalLossCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "loss"] }, 1, 0] },
            },
            totalPushCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "push"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {};
    const data = await withGameNames(items);

    return res.json({
      success: true,
      data,
      summary: {
        totalBetAmount: summary.totalBetAmount || 0,
        totalWinAmount: summary.totalWinAmount || 0,
        totalNetAmount: summary.totalNetAmount || 0,
        siteProfit: Number(summary.totalNetAmount || 0) * -1,
        totalWinCount: summary.totalWinCount || 0,
        totalLossCount: summary.totalLossCount || 0,
        totalPushCount: summary.totalPushCount || 0,
        totalRecords: total,
      },
      pagination: {
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


export default router;