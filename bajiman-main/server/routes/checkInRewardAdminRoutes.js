import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import CheckInRewardSetting from "../models/CheckInRewardSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

/* ======================================================
   HELPERS
====================================================== */

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, value = "") => {
  if (!value) return "";
  if (String(value).startsWith("http")) return value;

  const clean = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${clean}`;
};

const deleteLocalFile = (value = "") => {
  try {
    if (!value || String(value).startsWith("http")) return;

    const fullPath = path.resolve(value);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (err) {
    console.log("CHECK-IN FILE DELETE ERROR:", err.message);
  }
};

const parseJson = (value, fallback) => {
  try {
    if (typeof value === "undefined") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const filesByField = (req) => {
  const map = {};

  if (!Array.isArray(req.files)) return map;

  req.files.forEach((file) => {
    map[file.fieldname] = file;
  });

  return map;
};

const formatSetting = (req, setting) => {
  if (!setting) return null;

  const obj = setting.toObject ? setting.toObject() : setting;

  return {
    ...obj,

    launcherIconUrl: obj.launcherIcon
      ? buildFileUrl(req, obj.launcherIcon)
      : "",

    days: Array.isArray(obj.days)
      ? obj.days.map((day) => ({
          ...day,
          rewards: Array.isArray(day.rewards)
            ? day.rewards.map((reward) => ({
                ...reward,
                iconUrl: reward.icon ? buildFileUrl(req, reward.icon) : "",
              }))
            : [],
        }))
      : [],
  };
};

/**
 * Normalizes the incoming `days` JSON payload and matches any uploaded
 * reward icon files by their `days.<dayIndex>.rewards.<rewardIndex>.icon`
 * fieldname. When replacing an existing icon, the old file is removed.
 */
const normalizeDays = (days = [], fileMap = {}, existingDays = []) => {
  if (!Array.isArray(days)) {
    throw new Error("Days must be an array");
  }

  if (days.length < 1) {
    throw new Error("At least one Check-In day is required");
  }

  if (days.length > 7) {
    throw new Error("You cannot create more than 7 Check-In days");
  }

  const normalizedDays = days.map((day, dayIndex) => {
    const dayNumber = Number(day?.dayNumber ?? dayIndex + 1);

    const dayNameBn = String(day?.dayName?.bn || "").trim();
    const dayNameEn = String(day?.dayName?.en || "").trim();

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) {
      throw new Error(`Invalid day number at position ${dayIndex + 1}`);
    }

    if (!dayNameBn) {
      throw new Error(`Bangla day name is required for Day ${dayNumber}`);
    }

    if (!dayNameEn) {
      throw new Error(`English day name is required for Day ${dayNumber}`);
    }

    const rewardsInput = Array.isArray(day?.rewards) ? day.rewards : [];

    if (rewardsInput.length < 1) {
      throw new Error(`At least one reward is required for Day ${dayNumber}`);
    }

    if (rewardsInput.length > 5) {
      throw new Error(`Maximum 5 rewards are allowed for Day ${dayNumber}`);
    }

    const existingRewards = existingDays?.[dayIndex]?.rewards || [];

    const rewards = rewardsInput.map((reward, rewardIndex) => {
      const rewardType = String(reward?.rewardType || "").trim();
      const amount = Number(reward?.amount);

      if (!["balance", "reward_coin"].includes(rewardType)) {
        throw new Error(
          `Invalid reward type for Day ${dayNumber}, reward ${
            rewardIndex + 1
          }`,
        );
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          `Reward amount must be greater than 0 for Day ${dayNumber}, reward ${
            rewardIndex + 1
          }`,
        );
      }

      const uploadedFile =
        fileMap[`days.${dayIndex}.rewards.${rewardIndex}.icon`];

      let icon = String(reward?.icon || "").trim();

      if (uploadedFile) {
        const previousIcon = existingRewards[rewardIndex]?.icon;

        if (previousIcon && previousIcon !== icon) {
          deleteLocalFile(previousIcon);
        }

        icon = filePath(uploadedFile);
      }

      return { rewardType, amount, icon };
    });

    return {
      dayNumber,
      dayName: { bn: dayNameBn, en: dayNameEn },
      rewards,
    };
  });

  normalizedDays.sort((a, b) => a.dayNumber - b.dayNumber);

  const uniqueDayNumbers = new Set(
    normalizedDays.map((day) => day.dayNumber),
  );

  if (uniqueDayNumbers.size !== normalizedDays.length) {
    throw new Error("Duplicate day numbers are not allowed");
  }

  normalizedDays.forEach((day, index) => {
    const expectedDayNumber = index + 1;

    if (day.dayNumber !== expectedDayNumber) {
      throw new Error(
        `Day numbers must be continuous. Expected Day ${expectedDayNumber}`,
      );
    }
  });

  return normalizedDays;
};

const cleanupUploadedFiles = (req) => {
  if (Array.isArray(req.files)) {
    req.files.forEach((file) => deleteLocalFile(file.path));
  }
};

/* ======================================================
   ADMIN: GET CHECK-IN SETTING
   GET /api/admin/check-in-reward
====================================================== */

router.get("/admin/check-in-reward", protectAdmin, async (req, res) => {
  try {
    const setting = await CheckInRewardSetting.findOne({
      settingKey: "global",
    });

    return successResponse(
      res,
      "Check-In setting fetched successfully",
      formatSetting(req, setting),
    );
  } catch (err) {
    console.error("Get Check-In setting error:", err);
    return errorResponse(res, err.message || "Server error", 500);
  }
});

/* ======================================================
   ADMIN: CREATE CHECK-IN SETTING
   POST /api/admin/check-in-reward
====================================================== */

router.post(
  "/admin/check-in-reward",
  protectAdmin,
  upload.any(),
  async (req, res) => {
    try {
      const { titleBn, titleEn, descriptionBn, descriptionEn, days, isActive } =
        req.body || {};

      const existing = await CheckInRewardSetting.findOne({
        settingKey: "global",
      });

      if (existing) {
        cleanupUploadedFiles(req);

        return errorResponse(
          res,
          "Check-In setting already exists. Please update the existing setting.",
          409,
        );
      }

      const fileMap = filesByField(req);
      const normalizedDays = normalizeDays(parseJson(days, []), fileMap, []);

      const setting = await CheckInRewardSetting.create({
        settingKey: "global",

        title: {
          bn: String(titleBn || "দৈনিক চেক ইন").trim(),
          en: String(titleEn || "Daily Check In").trim(),
        },

        description: {
          bn: String(
            descriptionBn ||
              "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক প্রস্কার সংগ্রহ করুন।",
          ).trim(),
          en: String(
            descriptionEn || "Check in daily and collect your daily reward.",
          ).trim(),
        },

        launcherIcon: fileMap.launcherIcon ? filePath(fileMap.launcherIcon) : "",

        days: normalizedDays,
        version: 1,

        isActive: String(isActive) === "false" ? false : true,
      });

      return successResponse(
        res,
        "Check-In reward created successfully",
        formatSetting(req, setting),
        201,
      );
    } catch (err) {
      cleanupUploadedFiles(req);
      console.error("Create Check-In reward error:", err);

      return errorResponse(
        res,
        err.message || "Failed to create Check-In reward",
        400,
      );
    }
  },
);

/* ======================================================
   ADMIN: UPDATE CHECK-IN SETTING
   PUT /api/admin/check-in-reward/:id
====================================================== */

router.put(
  "/admin/check-in-reward/:id",
  protectAdmin,
  upload.any(),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        cleanupUploadedFiles(req);
        return errorResponse(res, "Invalid setting id", 400);
      }

      const setting = await CheckInRewardSetting.findById(id);

      if (!setting) {
        cleanupUploadedFiles(req);
        return errorResponse(res, "Check-In setting not found", 404);
      }

      const {
        titleBn,
        titleEn,
        descriptionBn,
        descriptionEn,
        days,
        isActive,
        removeLauncherIcon,
      } = req.body || {};

      const fileMap = filesByField(req);
      const existingDaysPlain = (setting.days || []).map((day) =>
        day.toObject ? day.toObject() : day,
      );

      const normalizedDays = normalizeDays(
        parseJson(days, existingDaysPlain),
        fileMap,
        existingDaysPlain,
      );

      setting.title = {
        bn: String(titleBn || setting.title?.bn || "দৈনিক চেক ইন").trim(),
        en: String(titleEn || setting.title?.en || "Daily Check In").trim(),
      };

      setting.description = {
        bn: String(descriptionBn ?? setting.description?.bn ?? "").trim(),
        en: String(descriptionEn ?? setting.description?.en ?? "").trim(),
      };

      setting.days = normalizedDays;

      /**
       * Configuration update বাড়ায় version।
       * Client claim route version mismatch পেলে
       * user-এর progress আবার Day 1 করবে।
       */
      setting.version = Number(setting.version || 1) + 1;

      if (typeof isActive !== "undefined") {
        setting.isActive = String(isActive) !== "false";
      }

      const previousLauncherIcon = setting.launcherIcon;

      if (fileMap.launcherIcon) {
        setting.launcherIcon = filePath(fileMap.launcherIcon);

        if (
          previousLauncherIcon &&
          !String(previousLauncherIcon).startsWith("http")
        ) {
          deleteLocalFile(previousLauncherIcon);
        }
      } else if (String(removeLauncherIcon) === "true") {
        if (
          previousLauncherIcon &&
          !String(previousLauncherIcon).startsWith("http")
        ) {
          deleteLocalFile(previousLauncherIcon);
        }

        setting.launcherIcon = "";
      }

      await setting.save();

      return successResponse(
        res,
        "Check-In reward updated successfully",
        formatSetting(req, setting),
      );
    } catch (err) {
      cleanupUploadedFiles(req);
      console.error("Update Check-In reward error:", err);

      return errorResponse(
        res,
        err.message || "Failed to update Check-In reward",
        400,
      );
    }
  },
);

/* ======================================================
   ADMIN: UPDATE ACTIVE/INACTIVE STATUS
   PATCH /api/admin/check-in-reward/:id/status
====================================================== */

router.patch(
  "/admin/check-in-reward/:id/status",
  protectAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse(res, "Invalid setting id", 400);
      }

      if (typeof isActive !== "boolean") {
        return errorResponse(res, "isActive must be true or false", 400);
      }

      const setting = await CheckInRewardSetting.findByIdAndUpdate(
        id,
        { isActive },
        { returnDocument: "after", runValidators: true },
      );

      if (!setting) {
        return errorResponse(res, "Check-In setting not found", 404);
      }

      return successResponse(
        res,
        isActive
          ? "Check-In reward activated successfully"
          : "Check-In reward deactivated successfully",
        formatSetting(req, setting),
      );
    } catch (err) {
      console.error("Update Check-In status error:", err);
      return errorResponse(res, err.message || "Server error", 500);
    }
  },
);

export default router;
