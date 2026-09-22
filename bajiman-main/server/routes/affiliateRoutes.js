import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();
const onlyDigits = (value = "") => String(value || "").replace(/\D/g, "");

const generateRandomLetters = (length = 10) => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }

  return result;
};

const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const createUniqueGamePlayName = async () => {
  for (let i = 0; i < 50; i += 1) {
    const name = generateRandomLetters(10);
    const exists = await User.exists({ userGamePlayName: name });
    if (!exists) return name;
  }

  throw new Error("Failed to generate unique gameplay name");
};

const createUniqueReferralCode = async () => {
  for (let i = 0; i < 50; i += 1) {
    const code = generateReferralCode();
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }

  throw new Error("Failed to generate unique referral code");
};

const makeUserPayload = (user) => ({
  id: user._id,
  _id: user._id,
  userId: user.userId,
  userGamePlayName: user.userGamePlayName,
  email: user.email,
  countryCode: user.countryCode,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  currency: user.currency,
  balance: user.balance,
  referralCode: user.referralCode,
  referralCount: user.referralCount,
  commissionBalance: user.commissionBalance,
  gameLossCommission: user.gameLossCommission,
  depositCommission: user.depositCommission,
  referCommission: user.referCommission,
  gameWinCommission: user.gameWinCommission,
  createdAt: user.createdAt,
});

/* =========================
   Affiliate Register
   role = aff-user
   isActive = false
   no auto login
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      userId,
      phone,
      email,
      password,
      countryCode = "+880",
      currency = "BDT",
    } = req.body || {};

    const finalUserId = clean(username || userId).toLowerCase();
    const finalPhone = onlyDigits(phone);
    const finalEmail = clean(email).toLowerCase();
    const finalPassword = String(password || "");
    const finalCountryCode = clean(countryCode || "+880");
    const finalCurrency = clean(currency || "BDT").toUpperCase();

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (finalUserId.length < 4 || finalUserId.length > 15) {
      return errorResponse(res, "Username must be 4-15 characters", 400);
    }

    if (!/^[a-z0-9]+$/.test(finalUserId)) {
      return errorResponse(res, "Username only allows letters and numbers", 400);
    }

    if (!finalPhone) {
      return errorResponse(res, "Phone number is required", 400);
    }

    if (!finalEmail) {
      return errorResponse(res, "Email is required", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return errorResponse(res, "Invalid email address", 400);
    }

    if (finalPassword.length < 6 || finalPassword.length > 20) {
      return errorResponse(res, "Password must be 6-20 characters", 400);
    }

    const usernameExists = await User.exists({ userId: finalUserId });
    if (usernameExists) {
      return errorResponse(res, "Username already exists", 409);
    }

    const phoneExists = await User.exists({
      countryCode: finalCountryCode,
      phone: finalPhone,
    });

    if (phoneExists) {
      return errorResponse(res, "Phone number already registered", 409);
    }

    const emailExists = await User.exists({ email: finalEmail });
    if (emailExists) {
      return errorResponse(res, "Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const userGamePlayName = await createUniqueGamePlayName();
    const referralCode = await createUniqueReferralCode();

    const user = await User.create({
      userId: finalUserId,
      userGamePlayName,
      email: finalEmail,
      countryCode: finalCountryCode,
      phone: finalPhone,
      password: hashedPassword,
      role: "aff-user",
      isActive: false,
      currency: finalCurrency || "BDT",
      referralCode,
    });

    return successResponse(
      res,
      "Affiliate registration successful. Admin approval required before login.",
      {
        user: makeUserPayload(user),
      },
      201,
    );
  } catch (error) {
    console.error("AFFILIATE REGISTER ERROR:", error);

    if (error?.code === 11000) {
      return errorResponse(res, "Duplicate affiliate data found", 409);
    }

    return errorResponse(res, error.message || "Affiliate registration failed", 500);
  }
});

/* =========================
   Affiliate Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, userId, password } = req.body || {};

    const finalUserId = clean(username || userId).toLowerCase();
    const finalPassword = String(password || "");

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (!finalPassword) {
      return errorResponse(res, "Password is required", 400);
    }

    const user = await User.findOne({
      userId: finalUserId,
      role: "aff-user",
    });

    if (!user) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(finalPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        "Your affiliate account is pending. You can login after admin approval.",
        403,
      );
    }

    const token = generateToken({
      id: user._id,
      userId: user.userId,
      role: user.role,
    });

    return successResponse(res, "Affiliate login successful", {
      user: makeUserPayload(user),
      token,
    });
  } catch (error) {
    console.error("AFFILIATE LOGIN ERROR:", error);
    return errorResponse(res, "Affiliate login failed", 500);
  }
});

/* =========================
   Affiliate Protect
========================= */
const protectAffiliate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded?.id).select("-password");

    if (!user) {
      return errorResponse(res, "Affiliate user not found", 401);
    }

    if (user.role !== "aff-user") {
      return errorResponse(res, "Affiliate access required", 403);
    }

    if (!user.isActive) {
      return errorResponse(res, "Affiliate account is inactive", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized - invalid token", 401);
  }
};

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const dateLabel = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

/* =========================
   Affiliate Dashboard Me
========================= */
router.get("/dashboard/me", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

    const referralIds = affiliate.createdUsers || [];

    const [totalReferrals, activeReferrals, thisMonthNewReferrals, recentReferrals] =
      await Promise.all([
        User.countDocuments({ referredBy: affiliate._id }),

        User.countDocuments({
          referredBy: affiliate._id,
          isActive: true,
        }),

        User.countDocuments({
          referredBy: affiliate._id,
          createdAt: { $gte: startOfMonth() },
        }),

        User.find({ referredBy: affiliate._id })
          .select(
            "userId phone email balance currency isActive createdAt referralCode",
          )
          .sort({ createdAt: -1 })
          .limit(8),
      ]);

    const totalCommissionEarned =
      Number(affiliate.referCommissionBalance || 0) +
      Number(affiliate.depositCommissionBalance || 0) +
      Number(affiliate.gameLossCommissionBalance || 0) +
      Number(affiliate.gameWinCommissionBalance || 0);

    const thisMonthEarnings = totalCommissionEarned;

    return successResponse(res, "Affiliate dashboard fetched", {
      affiliate: makeUserPayload(affiliate),

      stats: {
        totalReferrals,
        activeReferrals,
        thisMonthNewReferrals,

        totalCommissionEarned,
        thisMonthEarnings,

        commissionBalance: Number(affiliate.commissionBalance || 0),

        referCommissionBalance: Number(affiliate.referCommissionBalance || 0),
        depositCommissionBalance: Number(
          affiliate.depositCommissionBalance || 0,
        ),
        gameLossCommissionBalance: Number(
          affiliate.gameLossCommissionBalance || 0,
        ),
        gameWinCommissionBalance: Number(
          affiliate.gameWinCommissionBalance || 0,
        ),

        referCommission: Number(affiliate.referCommission || 0),
        depositCommission: Number(affiliate.depositCommission || 0),
        gameLossCommission: Number(affiliate.gameLossCommission || 0),
        gameWinCommission: Number(affiliate.gameWinCommission || 0),
      },

      recentReferrals,
      referralIds,
    });
  } catch (error) {
    console.error("AFFILIATE DASHBOARD ERROR:", error);
    return errorResponse(res, "Failed to load affiliate dashboard", 500);
  }
});

/* =========================
   Affiliate Earnings Chart
========================= */
router.get("/dashboard/earnings", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);

    const today = startOfDay(new Date());
    const startDate = addDays(today, -(days - 1));

    const referredUsers = await User.find({
      referredBy: affiliate._id,
      createdAt: { $gte: startDate },
    }).select("createdAt");

    const totalCommissionEarned =
      Number(affiliate.referCommissionBalance || 0) +
      Number(affiliate.depositCommissionBalance || 0) +
      Number(affiliate.gameLossCommissionBalance || 0) +
      Number(affiliate.gameWinCommissionBalance || 0);

    const perReferral =
      referredUsers.length > 0 ? totalCommissionEarned / referredUsers.length : 0;

    const labels = [];
    const dailyEarnings = [];
    const cumulativeEarnings = [];

    let running = 0;

    for (let i = 0; i < days; i += 1) {
      const day = addDays(startDate, i);
      const nextDay = addDays(day, 1);

      labels.push(dateLabel(day));

      const dayReferralCount = referredUsers.filter((user) => {
        const created = new Date(user.createdAt);
        return created >= day && created < nextDay;
      }).length;

      const daily = Number((dayReferralCount * perReferral).toFixed(2));
      running += daily;

      dailyEarnings.push(daily);
      cumulativeEarnings.push(Number(running.toFixed(2)));
    }

    return successResponse(res, "Affiliate earnings chart fetched", {
      labels,
      dailyEarnings,
      cumulativeEarnings,
      days,
    });
  } catch (error) {
    console.error("AFFILIATE EARNINGS ERROR:", error);
    return errorResponse(res, "Failed to load affiliate earnings chart", 500);
  }
});


/* =========================
   Affiliate: Commission Status
========================= */
router.get("/commission-status", protectAffiliate, async (req, res) => {
  try {
    const affiliate = await User.findById(req.user._id).select(
      "userId email phone currency balance commissionBalance gameLossCommission depositCommission referCommission gameWinCommission gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance referralCode referralCount isActive",
    );

    if (!affiliate) {
      return errorResponse(res, "Affiliate user not found", 404);
    }

    if (affiliate.role && affiliate.role !== "aff-user") {
      return errorResponse(res, "Affiliate access required", 403);
    }

    return successResponse(res, "Commission status fetched successfully", {
      userId: affiliate.userId,
      email: affiliate.email,
      phone: affiliate.phone,
      currency: affiliate.currency || "BDT",

      mainBalance: Number(affiliate.balance || 0),
      commissionBalance: Number(affiliate.commissionBalance || 0),

      gameLossCommission: Number(affiliate.gameLossCommission || 0),
      gameWinCommission: Number(affiliate.gameWinCommission || 0),
      referCommission: Number(affiliate.referCommission || 0),
      depositCommission: Number(affiliate.depositCommission || 0),

      gameWinCommissionBalance: Number(
        affiliate.gameWinCommissionBalance || 0,
      ),
      referCommissionBalance: Number(affiliate.referCommissionBalance || 0),
      depositCommissionBalance: Number(
        affiliate.depositCommissionBalance || 0,
      ),
      gameLossCommissionBalance: Number(
        affiliate.gameLossCommissionBalance || 0,
      ),

      referralCode: affiliate.referralCode || "",
      referralCount: Number(affiliate.referralCount || 0),
      isActive: Boolean(affiliate.isActive),
    });
  } catch (error) {
    console.error("AFFILIATE COMMISSION STATUS ERROR:", error);
    return errorResponse(res, "Failed to load commission status", 500);
  }
});

/* =========================
   Affiliate: My Referred Users
========================= */
router.get("/my-users", protectAffiliate, async (req, res) => {
  try {
    const affiliateId = req.user._id;

    const users = await User.find({
      role: "user",
      referredBy: affiliateId,
    })
      .select(
        "_id userId phone email countryCode balance currency isActive referralCode createdAt updatedAt",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "My users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("AFFILIATE MY USERS ERROR:", error);
    return errorResponse(res, "Failed to load referred users", 500);
  }
});

/* =========================
   Affiliate: Toggle My User Status
========================= */
router.patch("/my-users/:id/toggle-status", protectAffiliate, async (req, res) => {
  try {
    const affiliateId = req.user._id;
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return errorResponse(res, "isActive must be boolean", 400);
    }

    const user = await User.findOne({
      _id: id,
      role: "user",
      referredBy: affiliateId,
    });

    if (!user) {
      return errorResponse(res, "User not found in your referred list", 404);
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        _id: user._id,
        userId: user.userId,
        phone: user.phone,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("AFFILIATE TOGGLE MY USER ERROR:", error);
    return errorResponse(res, "Failed to update user status", 500);
  }
});

/* =========================
   Admin: Get All Affiliate Users
========================= */
router.get("/admin/affiliate-users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "aff-user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET AFFILIATE USERS ERROR:", error);
    return errorResponse(res, "Failed to load affiliate users", 500);
  }
});

/* =========================
   Admin: Toggle Affiliate Active + Commission
========================= */
router.patch(
  "/admin/affiliate-users/:id/toggle-active",
  protectAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        isActive,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
      } = req.body || {};

      const user = await User.findOne({
        _id: id,
        role: "aff-user",
      });

      if (!user) {
        return errorResponse(res, "Affiliate user not found", 404);
      }

      user.isActive = Boolean(isActive);

      if (typeof gameLossCommission !== "undefined") {
        user.gameLossCommission = Number(gameLossCommission) || 0;
      }

      if (typeof depositCommission !== "undefined") {
        user.depositCommission = Number(depositCommission) || 0;
      }

      if (typeof referCommission !== "undefined") {
        user.referCommission = Number(referCommission) || 0;
      }

      if (typeof gameWinCommission !== "undefined") {
        user.gameWinCommission = Number(gameWinCommission) || 0;
      }

      await user.save();

      return successResponse(
        res,
        user.isActive
          ? "Affiliate user activated successfully"
          : "Affiliate user deactivated successfully",
        {
          user: makeUserPayload(user),
        },
      );
    } catch (error) {
      console.error("TOGGLE AFFILIATE ERROR:", error);
      return errorResponse(res, "Failed to update affiliate user", 500);
    }
  },
);

/* =========================
   Admin: Affiliate User Details
========================= */
router.get("/admin/affiliate-users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "aff-user",
    }).select("-password");

    if (!user) {
      return errorResponse(res, "Affiliate user not found", 404);
    }

    return successResponse(res, "Affiliate user fetched", {
      user,
    });
  } catch (error) {
    console.error("GET AFFILIATE DETAILS ERROR:", error);
    return errorResponse(res, "Failed to load affiliate user details", 500);
  }
});


/* =========================
   Admin: Single Affiliate Details + Referred Users
========================= */
router.get("/admin/affiliate-users/:id/details", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const affiliate = await User.findOne({
      _id: id,
      role: "aff-user",
    })
      .select("-password")
      .populate("referredBy", "userId phone email referralCode");

    if (!affiliate) {
      return errorResponse(res, "Affiliate user not found", 404);
    }

    const referredUsers = await User.find({
      referredBy: affiliate._id,
      role: "user",
    })
      .select(
        "userId phone email balance currency isActive referralCode createdAt updatedAt",
      )
      .sort({ createdAt: -1 });

    return successResponse(res, "Affiliate details fetched", {
      affiliate,
      referredUsers,
      totalReferredUsers: referredUsers.length,
    });
  } catch (error) {
    console.error("GET SINGLE AFFILIATE DETAILS ERROR:", error);
    return errorResponse(res, "Failed to load affiliate details", 500);
  }
});

/* =========================
   Admin: Update Single Affiliate
========================= */
router.patch("/admin/affiliate-users/:id/details", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      userId,
      email,
      phone,
      firstName,
      lastName,
      password,
      isActive,
      currency,
      balance,
      commissionBalance,

      gameLossCommission,
      depositCommission,
      referCommission,
      gameWinCommission,

      gameLossCommissionBalance,
      depositCommissionBalance,
      referCommissionBalance,
      gameWinCommissionBalance,
    } = req.body || {};

    const affiliate = await User.findOne({
      _id: id,
      role: "aff-user",
    });

    if (!affiliate) {
      return errorResponse(res, "Affiliate user not found", 404);
    }

    const finalUserId = String(userId || "").trim().toLowerCase();
    const finalEmail = String(email || "").trim().toLowerCase();
    const finalPhone = String(phone || "").replace(/\D/g, "");

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (finalUserId.length < 4 || finalUserId.length > 15) {
      return errorResponse(res, "Username must be 4-15 characters", 400);
    }

    if (!/^[a-z0-9]+$/.test(finalUserId)) {
      return errorResponse(res, "Username only allows letters and numbers", 400);
    }

    if (!finalPhone) {
      return errorResponse(res, "Phone is required", 400);
    }

    if (finalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return errorResponse(res, "Invalid email address", 400);
    }

    const usernameExists = await User.exists({
      _id: { $ne: affiliate._id },
      userId: finalUserId,
    });

    if (usernameExists) {
      return errorResponse(res, "Username already exists", 409);
    }

    const phoneExists = await User.exists({
      _id: { $ne: affiliate._id },
      countryCode: affiliate.countryCode,
      phone: finalPhone,
    });

    if (phoneExists) {
      return errorResponse(res, "Phone already exists", 409);
    }

    if (finalEmail) {
      const emailExists = await User.exists({
        _id: { $ne: affiliate._id },
        email: finalEmail,
      });

      if (emailExists) {
        return errorResponse(res, "Email already exists", 409);
      }
    }

    affiliate.userId = finalUserId;
    affiliate.email = finalEmail;
    affiliate.phone = finalPhone;
    affiliate.firstName = String(firstName || "").trim();
    affiliate.lastName = String(lastName || "").trim();
    affiliate.isActive = Boolean(isActive);
    affiliate.currency = String(currency || affiliate.currency || "BDT").toUpperCase();

    affiliate.balance = Number(balance) || 0;
    affiliate.commissionBalance = Number(commissionBalance) || 0;

    affiliate.gameLossCommission = Number(gameLossCommission) || 0;
    affiliate.depositCommission = Number(depositCommission) || 0;
    affiliate.referCommission = Number(referCommission) || 0;
    affiliate.gameWinCommission = Number(gameWinCommission) || 0;

    affiliate.gameLossCommissionBalance =
      Number(gameLossCommissionBalance) || 0;
    affiliate.depositCommissionBalance =
      Number(depositCommissionBalance) || 0;
    affiliate.referCommissionBalance = Number(referCommissionBalance) || 0;
    affiliate.gameWinCommissionBalance =
      Number(gameWinCommissionBalance) || 0;

    if (password && String(password).trim()) {
      const finalPassword = String(password).trim();

      if (finalPassword.length < 6 || finalPassword.length > 20) {
        return errorResponse(res, "Password must be 6-20 characters", 400);
      }

      affiliate.password = await bcrypt.hash(finalPassword, 10);
    }

    await affiliate.save();

    const updatedAffiliate = await User.findById(affiliate._id)
      .select("-password")
      .populate("referredBy", "userId phone email referralCode");

    return successResponse(res, "Affiliate user updated successfully", {
      affiliate: updatedAffiliate,
    });
  } catch (error) {
    console.error("UPDATE SINGLE AFFILIATE ERROR:", error);

    if (error?.code === 11000) {
      return errorResponse(res, "Duplicate affiliate data found", 409);
    }

    return errorResponse(res, "Failed to update affiliate user", 500);
  }
});

export default router;