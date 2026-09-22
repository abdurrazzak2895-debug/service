import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/response.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

/* =========================
   GET MY PROFILE
========================= */
router.get("/me", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -createdUsers",
    );

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "Profile fetched successfully", {
      user,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch profile", 500);
  }
});

/* =========================
   UPDATE PROFILE
========================= */
router.put("/update-profile", protectUser, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body || {};

    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: user._id },
      });

      if (phoneExists) {
        return errorResponse(res, "Phone already exists", 409);
      }

      user.phone = phone.trim();
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return errorResponse(res, "Email already exists", 409);
      }

      user.email = email.toLowerCase().trim();
    }

    user.firstName = firstName || "";
    user.lastName = lastName || "";

    if (password) {
      if (password.length < 6) {
        return errorResponse(
          res,
          "Password must be at least 6 characters",
          400,
        );
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return successResponse(res, "Profile updated successfully", {
      user: {
        _id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || "Profile update failed", 500);
  }
});

export default router;
