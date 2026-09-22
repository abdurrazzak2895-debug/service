import express from "express";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import ReferRedeemHistory from "../models/ReferRedeemHistory.js";
import User from "../models/User.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

const getAdminId = (req) => {
  return req.admin?.id || req.admin?._id || null;
};

const getOrCreateSetting = async () => {
  let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

  if (!setting) {
    setting = await ReferRedeemSetting.create({});
  }

  return setting;
};

router.get("/settings", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("GET REFER REDEEM SETTING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const {
      referAmountForAllUsers,
      minimumRedeemAmount,
      maximumRedeemAmount,
      redeemPoint,
      redeemMoney,
      isActive,
    } = req.body || {};

    const clean = {
      referAmountForAllUsers: Number(referAmountForAllUsers || 0),
      minimumRedeemAmount: Number(minimumRedeemAmount || 0),
      maximumRedeemAmount: Number(maximumRedeemAmount || 0),
      redeemPoint: Number(redeemPoint || 0),
      redeemMoney: Number(redeemMoney || 0),
      isActive: Boolean(isActive),
      updatedBy: getAdminId(req),
    };

    if (clean.referAmountForAllUsers < 0) {
      return res.status(400).json({
        success: false,
        message: "Refer amount cannot be negative",
      });
    }

    if (clean.minimumRedeemAmount < 0 || clean.maximumRedeemAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum and maximum redeem amount cannot be negative",
      });
    }

    if (
      clean.maximumRedeemAmount > 0 &&
      clean.maximumRedeemAmount < clean.minimumRedeemAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum redeem amount must be greater than minimum redeem amount",
      });
    }

    if (clean.redeemPoint <= 0 || clean.redeemMoney <= 0) {
      return res.status(400).json({
        success: false,
        message: "Redeem point and redeem money must be greater than 0",
      });
    }

    const setting = await getOrCreateSetting();

    setting.referAmountForAllUsers = clean.referAmountForAllUsers;
    setting.minimumRedeemAmount = clean.minimumRedeemAmount;
    setting.maximumRedeemAmount = clean.maximumRedeemAmount;
    setting.redeemPoint = clean.redeemPoint;
    setting.redeemMoney = clean.redeemMoney;
    setting.isActive = clean.isActive;
    setting.updatedBy = clean.updatedBy;

    await setting.save();

    return res.json({
      success: true,
      message: "Refer redeem setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("UPDATE REFER REDEEM SETTING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/apply-to-users", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const amount = Number(setting.referAmountForAllUsers || 0);

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid refer amount",
      });
    }

    const result = await User.updateMany(
      { role: "user" },
      {
        $set: {
          referCommission: amount,
        },
      },
    );

    return res.json({
      success: true,
      message: "Refer amount applied to all users successfully",
      data: {
        referCommission: amount,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("APPLY REFER AMOUNT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/histories", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (q) {
      filter.$or = [
        { userId: { $regex: q, $options: "i" } },
        { note: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      ReferRedeemHistory.find(filter)
        .populate(
          "user",
          "userId countryCode phone role balance referCommissionBalance",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReferRedeemHistory.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET REFER REDEEM HISTORIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
