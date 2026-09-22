import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const cleanEmail = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const safeUser = (user) => {
  return {
    id: user._id,
    userId: user.userId,
    userGamePlayName: user.userGamePlayName || "",
    email: user.email || "",
    countryCode: user.countryCode || "",
    phone: user.phone || "",
    role: user.role,
    isActive: user.isActive,
    currency: user.currency || "BDT",
    balance: user.balance || 0,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    referralCode: user.referralCode || "",
    referralCount: user.referralCount || 0,
    commissionBalance: user.commissionBalance || 0,
    gameLossCommission: user.gameLossCommission || 0,
    depositCommission: user.depositCommission || 0,
    referCommission: user.referCommission || 0,
    gameWinCommission: user.gameWinCommission || 0,
    gameLossCommissionBalance: user.gameLossCommissionBalance || 0,
    depositCommissionBalance: user.depositCommissionBalance || 0,
    referCommissionBalance: user.referCommissionBalance || 0,
    gameWinCommissionBalance: user.gameWinCommissionBalance || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/* =========================
   GET LOGGED-IN USER INFO
   GET /api/user-info/me
========================= */
router.get("/me", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User info fetched successfully", {
      user: safeUser(user),
    });
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to fetch user info",
      500,
    );
  }
});

/* =========================
   UPDATE LOGGED-IN USER INFO
   PATCH /api/user-info/me
========================= */
router.patch("/me", protectUser, async (req, res) => {
  try {
    // countryCode/phone are intentionally NOT accepted here — like userId,
    // the registration phone number is a fixed anchor (withdraw OTP and
    // the auto e-wallet slot are both tied to it) and can't be changed
    // from the profile screen.
    const { email, firstName, lastName } = req.body || {};

    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const updateData = {};

    if (email !== undefined) {
      const nextEmail = cleanEmail(email);

      if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
        return errorResponse(res, "Invalid email address", 400);
      }

      updateData.email = nextEmail;
    }

    if (firstName !== undefined) {
      updateData.firstName = cleanText(firstName).slice(0, 50);
    }

    if (lastName !== undefined) {
      updateData.lastName = cleanText(lastName).slice(0, 50);
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, "No update data provided", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-password");

    return successResponse(res, "User info updated successfully", {
      user: safeUser(updatedUser),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Phone number already used", 409);
    }

    return errorResponse(
      res,
      error.message || "Failed to update user info",
      500,
    );
  }
});

/* =========================
   CHANGE USER PASSWORD
   PATCH /api/user-info/change-password
========================= */
router.patch("/change-password", protectUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, "All password fields are required", 400);
    }

    if (String(newPassword).length < 6) {
      return errorResponse(
        res,
        "New password must be at least 6 characters",
        400,
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, "Confirm password does not match", 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse(
        res,
        "New password must be different from current password",
        400,
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return successResponse(
      res,
      "Password changed successfully. Please login again.",
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to change password",
      500,
    );
  }
});

/* =========================
   GET USER CURRENT BALANCE
   GET /api/user-info/balance
========================= */
router.get("/balance", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "balance currency commissionBalance gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance",
    );

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "Balance fetched successfully", {
      balance: Number(user.balance || 0),
      currency: user.currency || "BDT",
      commissionBalance: Number(user.commissionBalance || 0),
      gameLossCommissionBalance: Number(user.gameLossCommissionBalance || 0),
      depositCommissionBalance: Number(user.depositCommissionBalance || 0),
      referCommissionBalance: Number(user.referCommissionBalance || 0),
      gameWinCommissionBalance: Number(user.gameWinCommissionBalance || 0),
    });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch balance", 500);
  }
});

export default router;
