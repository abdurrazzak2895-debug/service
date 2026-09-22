import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import {
  isRegisterOtpVerified,
  clearRegisterOtp,
} from "./forgotPasswordRoutes.js";
import { getOrCreateOtpSetting } from "./otpSettingRoutes.js";
import { getActiveRegisterBonusCampaign } from "./registerBonusCampaignRoutes.js";

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

const normalizeCountryCode = (value = "") => {
  const cleaned = clean(value);

  if (!cleaned) return "";

  return cleaned.startsWith("+") ? cleaned : `+${cleaned.replace(/\D/g, "")}`;
};

const normalizePhoneByCountry = (countryCode, phone) => {
  let finalPhone = onlyDigits(phone);

  if (countryCode === "+880" && finalPhone && !finalPhone.startsWith("0")) {
    finalPhone = `0${finalPhone}`;
  }

  return finalPhone;
};

const makeUserPayload = (user) => ({
  id: user._id,
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
  referredBy: user.referredBy,
  referralCount: user.referralCount,
  commissionBalance: user.commissionBalance,
  createdAt: user.createdAt,
});

/* =========================
   Register User
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      userId,
      password,
      countryCode,
      phone,
      currency = "BDT",
      referCode = "",
      referralCode = "",
      otp = "",
    } = req.body || {};

    const finalUserId = clean(username || userId).toLowerCase();
    const finalCountryCode = normalizeCountryCode(countryCode);
    const finalPhone = normalizePhoneByCountry(finalCountryCode, phone);
    const finalPassword = String(password || "");
    const finalCurrency = clean(currency || "BDT").toUpperCase();
    const submittedOtp = clean(otp);

    const submittedReferCode = clean(referCode || referralCode).toUpperCase();

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (finalUserId.length < 4 || finalUserId.length > 15) {
      return errorResponse(res, "Username must be 4-15 characters", 400);
    }

    if (/\s/.test(finalUserId)) {
      return errorResponse(res, "Username cannot contain space", 400);
    }

    if (!/^[a-z0-9]+$/.test(finalUserId)) {
      return errorResponse(
        res,
        "Username only allows letters and numbers",
        400,
      );
    }

    if (!finalCountryCode) {
      return errorResponse(res, "Country code is required", 400);
    }

    if (!finalPhone) {
      return errorResponse(res, "Phone number is required", 400);
    }

    if (finalPassword.length < 6 || finalPassword.length > 20) {
      return errorResponse(res, "Password must be 6-20 characters", 400);
    }

    if (!/[a-zA-Z]/.test(finalPassword)) {
      return errorResponse(
        res,
        "Password must contain at least one alphabet",
        400,
      );
    }

    if (!/\d/.test(finalPassword)) {
      return errorResponse(
        res,
        "Password must contain at least one number",
        400,
      );
    }

    const userExists = await User.exists({ userId: finalUserId });

    if (userExists) {
      return errorResponse(res, "Username already exists", 409);
    }

    const phoneExists = await User.exists({
      countryCode: finalCountryCode,
      phone: finalPhone,
    });

    if (phoneExists) {
      return errorResponse(res, "Phone number already registered", 409);
    }

    const otpSetting = await getOrCreateOtpSetting();

    if (finalCountryCode === "+880" && otpSetting.registerEnabled) {
      const otpOk = isRegisterOtpVerified({
        countryCode: finalCountryCode,
        phone: finalPhone,
        otp: submittedOtp,
      });

      if (!otpOk) {
        return errorResponse(res, "Please verify OTP first", 400);
      }
    }

    const referRedeemSetting = await ReferRedeemSetting.findOne().sort({
      createdAt: 1,
    });

    const defaultUserReferCommission = Number(
      referRedeemSetting?.referAmountForAllUsers || 0,
    );

    const safeDefaultReferCommission =
      Number.isFinite(defaultUserReferCommission) &&
      defaultUserReferCommission >= 0
        ? defaultUserReferCommission
        : 0;

    let referredByUser = null;
    let referCommissionAmount = 0;

    if (submittedReferCode) {
      referredByUser = await User.findOne({
        referralCode: submittedReferCode,
      }).select(
        "_id role isActive createdUsers referralCount referCommission referCommissionBalance commissionBalance",
      );

      if (!referredByUser) {
        return errorResponse(res, "Invalid refer code", 400);
      }

      if (!referredByUser.isActive) {
        return errorResponse(res, "Refer code is inactive", 400);
      }

      referCommissionAmount = Number(referredByUser.referCommission || 0);

      if (
        !Number.isFinite(referCommissionAmount) ||
        referCommissionAmount < 0
      ) {
        referCommissionAmount = 0;
      }
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const userGamePlayName = await createUniqueGamePlayName();
    const myReferralCode = await createUniqueReferralCode();

    const user = await User.create({
      userId: finalUserId,
      userGamePlayName,
      countryCode: finalCountryCode,
      phone: finalPhone,
      password: hashedPassword,
      role: "user",
      currency: finalCurrency || "BDT",
      referralCode: myReferralCode,
      referCommission: safeDefaultReferCommission,
      referredBy: referredByUser?._id || null,
    });

    if (referredByUser) {
      await User.updateOne(
        { _id: referredByUser._id },
        {
          $addToSet: {
            createdUsers: user._id,
          },
          $inc: {
            referralCount: 1,
            referCommissionBalance: referCommissionAmount,
            commissionBalance: referCommissionAmount,
          },
        },
      );
    }

    let registerBonusApplied = null;
    const activeBonusCampaign = await getActiveRegisterBonusCampaign();

    if (activeBonusCampaign) {
      const bonusAmount = Number(activeBonusCampaign.bonusAmount || 0);
      const targetTurnover =
        bonusAmount * Number(activeBonusCampaign.turnoverMultiplier ?? 1);

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: bonusAmount } },
      );

      user.balance = Number(user.balance || 0) + bonusAmount;

      if (targetTurnover > 0) {
        await TurnOver.create({
          user: user._id,
          sourceType: "register-bonus",
          sourceId: activeBonusCampaign._id,
          required: targetTurnover,
          progress: 0,
          status: "running",
          creditedAmount: bonusAmount,
          eligibleProviders: activeBonusCampaign.eligibleProviders || [],
        });
      }

      registerBonusApplied = {
        campaignId: activeBonusCampaign._id,
        bonusAmount,
        targetTurnover,
      };
    }

    clearRegisterOtp({
      countryCode: finalCountryCode,
      phone: finalPhone,
    });

    const token = generateToken({
      id: user._id,
      userId: user.userId,
      role: user.role,
    });

    return successResponse(
      res,
      referredByUser
        ? "Registration successful with referral"
        : "Registration successful",
      {
        user: makeUserPayload(user),
        token,
        referral: referredByUser
          ? {
              referrerId: referredByUser._id,
              referCode: submittedReferCode,
              referCommissionAmount,
            }
          : null,
        registerBonus: registerBonusApplied,
      },
      201,
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error?.code === 11000) {
      return errorResponse(res, "Duplicate user data found", 409);
    }

    return errorResponse(res, error.message || "Registration failed", 500);
  }
});

/* =========================
   Login User
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
      role: "user",
    });

    if (!user) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(finalPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Your account is inactive", 403);
    }

    const token = generateToken({
      id: user._id,
      userId: user.userId,
      role: user.role,
    });

    return successResponse(res, "Login successful", {
      user: makeUserPayload(user),
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return errorResponse(res, "Login failed", 500);
  }
});

/* =========================
   Get Logged In User
========================= */
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.id || decoded?._id;

    if (!userId) {
      return errorResponse(res, "Invalid token", 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized - invalid token", 401);
  }
};

router.get("/me", requireAuth, async (req, res) => {
  return successResponse(res, "User profile fetched", {
    user: makeUserPayload(req.user),
  });
});

/* =========================
   Admin: Get All Normal Users
========================= */
router.get("/admin/users", protectAdmin, async (req, res) => {
  try {
    const { q = "", status = "all", page = 1, limit = 15 } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 15, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      role: "user",
    };

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    if (String(q || "").trim()) {
      const keyword = String(q).trim();
      const regex = new RegExp(
        keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { userId: regex },
        { phone: regex },
        { email: regex },
        { referralCode: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const [users, total, activeCount, inactiveCount] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("referredBy", "userId phone email referralCode role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      User.countDocuments(filter),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      User.countDocuments({
        role: "user",
        isActive: false,
      }),
    ]);

    return successResponse(res, "Users fetched successfully", {
      users,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        totalUsers: activeCount + inactiveCount,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
      },
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    return errorResponse(res, "Failed to load users", 500);
  }
});

/* =========================
   Admin: Toggle Normal User Active
========================= */
router.patch(
  "/admin/users/:id/toggle-active",
  protectAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body || {};

      if (typeof isActive !== "boolean") {
        return errorResponse(res, "isActive must be boolean", 400);
      }

      const user = await User.findOne({
        _id: id,
        role: "user",
      });

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      user.isActive = isActive;
      await user.save();

      return successResponse(
        res,
        user.isActive
          ? "User activated successfully"
          : "User deactivated successfully",
        {
          user: {
            _id: user._id,
            userId: user.userId,
            phone: user.phone,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            balance: user.balance,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
          },
        },
      );
    } catch (error) {
      console.error("ADMIN TOGGLE USER ERROR:", error);
      return errorResponse(res, "Failed to update user status", 500);
    }
  },
);

/* =========================
   Admin: Get Single Normal User Details
========================= */
router.get("/admin/users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    })
      .select("-password")
      .populate("referredBy", "userId phone email referralCode role");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User details fetched successfully", {
      user,
    });
  } catch (error) {
    console.error("ADMIN GET SINGLE USER ERROR:", error);
    return errorResponse(res, "Failed to load user details", 500);
  }
});

/* =========================
   Admin: Single Normal User Details
========================= */
router.get("/admin/users/:id/details", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "user",
    })
      .select("-password")
      .populate("referredBy", "userId phone email referralCode role");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User details fetched successfully", {
      user,
    });
  } catch (error) {
    console.error("GET SINGLE USER DETAILS ERROR:", error);
    return errorResponse(res, "Failed to load user details", 500);
  }
});

/* =========================
   Admin: Update Single Normal User
========================= */
router.patch("/admin/users/:id/details", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      userId,
      email,
      phone,
      countryCode,
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

    const user = await User.findOne({
      _id: id,
      role: "user",
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const finalUserId = String(userId || "")
      .trim()
      .toLowerCase();
    const finalEmail = String(email || "")
      .trim()
      .toLowerCase();
    const finalPhone = String(phone || "").replace(/\D/g, "");
    const finalCountryCode = String(
      countryCode || user.countryCode || "",
    ).trim();

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (finalUserId.length < 4 || finalUserId.length > 15) {
      return errorResponse(res, "Username must be 4-15 characters", 400);
    }

    if (!/^[a-z0-9]+$/.test(finalUserId)) {
      return errorResponse(
        res,
        "Username only allows letters and numbers",
        400,
      );
    }

    if (!finalCountryCode) {
      return errorResponse(res, "Country code is required", 400);
    }

    if (!finalPhone) {
      return errorResponse(res, "Phone is required", 400);
    }

    if (finalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return errorResponse(res, "Invalid email address", 400);
    }

    const usernameExists = await User.exists({
      _id: { $ne: user._id },
      userId: finalUserId,
    });

    if (usernameExists) {
      return errorResponse(res, "Username already exists", 409);
    }

    const phoneExists = await User.exists({
      _id: { $ne: user._id },
      countryCode: finalCountryCode,
      phone: finalPhone,
    });

    if (phoneExists) {
      return errorResponse(res, "Phone already exists", 409);
    }

    if (finalEmail) {
      const emailExists = await User.exists({
        _id: { $ne: user._id },
        email: finalEmail,
      });

      if (emailExists) {
        return errorResponse(res, "Email already exists", 409);
      }
    }

    user.userId = finalUserId;
    user.email = finalEmail;
    user.countryCode = finalCountryCode;
    user.phone = finalPhone;
    user.firstName = String(firstName || "").trim();
    user.lastName = String(lastName || "").trim();
    user.isActive = Boolean(isActive);
    user.currency = String(currency || user.currency || "BDT").toUpperCase();

    user.balance = Number(balance) || 0;

    user.commissionBalance = Number(commissionBalance) || 0;
    user.gameLossCommission = Number(gameLossCommission) || 0;
    user.depositCommission = Number(depositCommission) || 0;
    user.referCommission = Number(referCommission) || 0;
    user.gameWinCommission = Number(gameWinCommission) || 0;

    user.gameLossCommissionBalance = Number(gameLossCommissionBalance) || 0;
    user.depositCommissionBalance = Number(depositCommissionBalance) || 0;
    user.referCommissionBalance = Number(referCommissionBalance) || 0;
    user.gameWinCommissionBalance = Number(gameWinCommissionBalance) || 0;

    if (password && String(password).trim()) {
      const finalPassword = String(password).trim();

      if (finalPassword.length < 6 || finalPassword.length > 20) {
        return errorResponse(res, "Password must be 6-20 characters", 400);
      }

      user.password = await bcrypt.hash(finalPassword, 10);
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("referredBy", "userId phone email referralCode role");

    return successResponse(res, "User updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE SINGLE USER ERROR:", error);

    if (error?.code === 11000) {
      return errorResponse(res, "Duplicate user data found", 409);
    }

    return errorResponse(res, "Failed to update user", 500);
  }
});

export default router;
