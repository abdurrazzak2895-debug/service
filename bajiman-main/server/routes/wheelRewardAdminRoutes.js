// routes/wheelRewardAdminRoutes.js

import express from "express";
import mongoose from "mongoose";

import WheelReward from "../models/WheelReward.js";
import WheelSpinHistory from "../models/WheelSpinHistory.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

/**
 * দুইটি আলাদা image field গ্রহণ করবে:
 * 1. backgroundImage
 * 2. wheelImage
 */
const wheelImageUpload = upload.fields([
  {
    name: "backgroundImage",
    maxCount: 1,
  },
  {
    name: "wheelImage",
    maxCount: 1,
  },
]);

/* ======================================================
   HELPERS
====================================================== */

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseJSON = (value, fieldName, fallback = null) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} must be valid JSON`);
  }
};

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return fallback;
};

const parseNumber = (value, fieldName, options = {}) => {
  const { min = 0, max = Infinity, fallback } = options;

  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`${fieldName} is required`);
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (number < min || number > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }

  return number;
};

const parseDate = (value, fieldName) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} is invalid`);
  }

  return date;
};

/* ======================================================
   SEGMENT VALIDATION
====================================================== */

const normalizeSegments = (segmentsValue) => {
  const segments = parseJSON(segmentsValue, "segments", []);

  if (!Array.isArray(segments)) {
    throw new Error("Segments must be an array");
  }

  if (segments.length !== 8) {
    throw new Error("A Wheel must contain exactly 8 segments");
  }

  const normalizedSegments = segments.map((segment, index) => {
    const position = parseNumber(
      segment?.position ?? index + 1,
      `Segment ${index + 1} position`,
      {
        min: 1,
        max: 8,
      },
    );

    const textBn = String(segment?.text?.bn || segment?.textBn || "").trim();

    const textEn = String(segment?.text?.en || segment?.textEn || "").trim();

    const prizeType = String(segment?.prizeType || "").trim();

    const amount = parseNumber(
      segment?.amount ?? 0,
      `Segment ${position} amount`,
      {
        min: 0,
      },
    );

    const probability = parseNumber(
      segment?.probability,
      `Segment ${position} probability`,
      {
        min: 0,
        max: 100,
      },
    );

    let turnoverMultiplier = parseNumber(
      segment?.turnoverMultiplier ?? 0,
      `Segment ${position} turnover multiplier`,
      {
        min: 0,
      },
    );

    const isActive = parseBoolean(segment?.isActive, true);

    if (!textBn) {
      throw new Error(`Bangla text is required for Segment ${position}`);
    }

    if (!textEn) {
      throw new Error(`English text is required for Segment ${position}`);
    }

    if (!["balance", "reward_coin", "no_prize"].includes(prizeType)) {
      throw new Error(`Invalid prize type for Segment ${position}`);
    }

    if (prizeType !== "no_prize" && amount <= 0) {
      throw new Error(
        `Prize amount must be greater than 0 for Segment ${position}`,
      );
    }

    if (prizeType === "no_prize" && amount !== 0) {
      throw new Error(`No Prize amount must be 0 for Segment ${position}`);
    }

    /**
     * Reward Coin এবং No Prize-এর turnover থাকবে না।
     */
    if (prizeType !== "balance") {
      turnoverMultiplier = 0;
    }

    if (!isActive && probability > 0) {
      throw new Error(`Inactive Segment ${position} probability must be 0`);
    }

    return {
      position,

      text: {
        bn: textBn,
        en: textEn,
      },

      prizeType,
      amount,
      probability,
      turnoverMultiplier,

      backgroundColor: String(segment?.backgroundColor || "#ffc800").trim(),

      textColor: String(segment?.textColor || "#000000").trim(),

      textSize: parseNumber(
        segment?.textSize ?? 14,
        `Segment ${position} text size`,
        {
          min: 8,
          max: 40,
        },
      ),

      fontWeight: segment?.fontWeight || "bold",

      isActive,
    };
  });

  normalizedSegments.sort((first, second) => first.position - second.position);

  const uniquePositions = new Set(
    normalizedSegments.map((segment) => segment.position),
  );

  if (uniquePositions.size !== 8) {
    throw new Error("Duplicate segment positions are not allowed");
  }

  normalizedSegments.forEach((segment, index) => {
    const expectedPosition = index + 1;

    if (segment.position !== expectedPosition) {
      throw new Error(`Missing Segment ${expectedPosition}`);
    }
  });

  const totalProbability = normalizedSegments.reduce((total, segment) => {
    return total + (segment.isActive ? segment.probability : 0);
  }, 0);

  if (Math.abs(totalProbability - 100) > 0.001) {
    throw new Error(
      `Active segment probability total must be 100%. Current total: ${totalProbability}%`,
    );
  }

  return normalizedSegments;
};

/* ======================================================
   DESIGN NORMALIZATION
====================================================== */

const normalizeDesign = (designValue) => {
  const design = parseJSON(designValue, "design", {});

  return {
    pageBackgroundColor: String(
      design?.pageBackgroundColor || "#66005f",
    ).trim(),

    cardBackgroundColor: String(
      design?.cardBackgroundColor || "#ffffff",
    ).trim(),

    wheelBackgroundColor: String(
      design?.wheelBackgroundColor || "#ffffff",
    ).trim(),

    wheelBorderColor: String(design?.wheelBorderColor || "#d89d00").trim(),

    wheelBorderWidth: parseNumber(
      design?.wheelBorderWidth ?? 8,
      "Wheel border width",
      {
        min: 0,
        max: 40,
      },
    ),

    pointerColor: String(design?.pointerColor || "#ffc800").trim(),

    centerButtonColor: String(design?.centerButtonColor || "#ffc800").trim(),

    centerButtonTextColor: String(
      design?.centerButtonTextColor || "#000000",
    ).trim(),

    titleColor: String(design?.titleColor || "#ffffff").trim(),

    descriptionColor: String(design?.descriptionColor || "#ffffff").trim(),

    costBoxColor: String(design?.costBoxColor || "#ffc800").trim(),

    costTextColor: String(design?.costTextColor || "#000000").trim(),
  };
};

/* ======================================================
   CONDITION NORMALIZATION
====================================================== */

const normalizeConditions = (conditionsValue) => {
  const conditions = parseJSON(conditionsValue, "conditions", {});

  return {
    dailySpinLimit: parseNumber(
      conditions?.dailySpinLimit ?? 0,
      "Daily Spin limit",
      {
        min: 0,
      },
    ),

    totalSpinLimit: parseNumber(
      conditions?.totalSpinLimit ?? 0,
      "Total Spin limit",
      {
        min: 0,
      },
    ),

    cooldownMinutes: parseNumber(
      conditions?.cooldownMinutes ?? 0,
      "Cooldown minutes",
      {
        min: 0,
      },
    ),

    minimumDeposit: parseNumber(
      conditions?.minimumDeposit ?? 0,
      "Minimum deposit",
      {
        min: 0,
      },
    ),

    minimumTurnover: parseNumber(
      conditions?.minimumTurnover ?? 0,
      "Minimum turnover",
      {
        min: 0,
      },
    ),

    minimumGameLoss: parseNumber(
      conditions?.minimumGameLoss ?? 0,
      "Minimum game loss",
      {
        min: 0,
      },
    ),
  };
};

/* ======================================================
   REQUEST DATA NORMALIZATION
====================================================== */

const normalizeWheelData = (req, existingWheel = null) => {
  const body = req.body || {};

  const titleData = parseJSON(body.title, "title", {});

  const descriptionData = parseJSON(body.description, "description", {});

  const spinButtonTextData = parseJSON(
    body.spinButtonText,
    "spinButtonText",
    {},
  );

  const titleBn = String(titleData?.bn || body.titleBn || "").trim();

  const titleEn = String(titleData?.en || body.titleEn || "").trim();

  if (!titleBn) {
    throw new Error("Bangla Wheel title is required");
  }

  if (!titleEn) {
    throw new Error("English Wheel title is required");
  }

  const segments = normalizeSegments(body.segments);

  const design = normalizeDesign(body.design);

  const conditions = normalizeConditions(body.conditions);

  const startAt = parseDate(body.startAt, "Start date");

  const endAt = parseDate(body.endAt, "End date");

  if (startAt && endAt && endAt <= startAt) {
    throw new Error("End date must be later than start date");
  }

  const uploadedBackgroundImage = req.files?.backgroundImage?.[0];

  const uploadedWheelImage = req.files?.wheelImage?.[0];

  const backgroundImage = uploadedBackgroundImage
    ? `/uploads/${uploadedBackgroundImage.filename}`
    : existingWheel?.backgroundImage || "";

  const wheelImage = uploadedWheelImage
    ? `/uploads/${uploadedWheelImage.filename}`
    : existingWheel?.wheelImage || "";

  if (!backgroundImage) {
    throw new Error("Background image upload is required");
  }

  if (!wheelImage) {
    throw new Error("Wheel image upload is required");
  }

  return {
    backgroundImage,
    wheelImage,

    title: {
      bn: titleBn,
      en: titleEn,
    },

    description: {
      bn: String(descriptionData?.bn || body.descriptionBn || "").trim(),

      en: String(descriptionData?.en || body.descriptionEn || "").trim(),
    },

    spinButtonText: {
      bn: String(
        spinButtonTextData?.bn || body.spinButtonTextBn || "স্পিন",
      ).trim(),

      en: String(
        spinButtonTextData?.en || body.spinButtonTextEn || "SPIN",
      ).trim(),
    },

    spinCost: parseNumber(body.spinCost, "Spin cost", {
      min: 0,
    }),

    segments,
    design,
    conditions,
    startAt,
    endAt,

    order: parseNumber(body.order ?? 0, "Order", {
      min: 0,
    }),

    isActive: parseBoolean(body.isActive, true),
  };
};

/* ======================================================
   ADMIN: GET ALL WHEELS
   GET /api/admin/wheels
====================================================== */

router.get("/admin/wheels", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "").trim();

    const filter = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        {
          "title.bn": regex,
        },
        {
          "title.en": regex,
        },
        {
          "description.bn": regex,
        },
        {
          "description.en": regex,
        },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const [wheels, total] = await Promise.all([
      WheelReward.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      WheelReward.countDocuments(filter),
    ]);

    res.json({
      success: true,
      wheels,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    console.error("Get Admin Wheels error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   ADMIN: GET SINGLE WHEEL
   GET /api/admin/wheels/:id
====================================================== */

router.get("/admin/wheels/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel id",
      });
    }

    const wheel = await WheelReward.findById(req.params.id);

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    res.json({
      success: true,
      wheel,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   ADMIN: CREATE WHEEL
   POST /api/admin/wheels

   FormData image field names:
   backgroundImage
   wheelImage
====================================================== */

router.post("/admin/wheels", protectAdmin, wheelImageUpload, async (req, res) => {
  try {
    if (!req.files?.backgroundImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Background image upload is required",
      });
    }

    if (!req.files?.wheelImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Wheel image upload is required",
      });
    }

    const wheelData = normalizeWheelData(req);

    const wheel = await WheelReward.create(wheelData);

    res.status(201).json({
      success: true,
      message: "Wheel created successfully",
      wheel,
    });
  } catch (err) {
    console.error("Create Wheel error:", err);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to create Wheel",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE WHEEL
   PUT /api/admin/wheels/:id

   Images are optional during update.
   নতুন image না দিলে পুরনো image থাকবে।
====================================================== */

router.put("/admin/wheels/:id", protectAdmin, wheelImageUpload, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel id",
      });
    }

    const wheel = await WheelReward.findById(req.params.id);

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    const wheelData = normalizeWheelData(req, wheel);

    Object.assign(wheel, wheelData);

    await wheel.save();

    res.json({
      success: true,
      message: "Wheel updated successfully",
      wheel,
    });
  } catch (err) {
    console.error("Update Wheel error:", err);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to update Wheel",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE STATUS
   PATCH /api/admin/wheels/:id/status
====================================================== */

router.patch("/admin/wheels/:id/status", protectAdmin, async (req, res) => {
  try {
    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel id",
      });
    }

    const wheel = await WheelReward.findByIdAndUpdate(
      req.params.id,
      {
        isActive,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    res.json({
      success: true,

      message: isActive
        ? "Wheel activated successfully"
        : "Wheel deactivated successfully",

      wheel,
    });
  } catch (err) {
    console.error("Update Wheel status error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   ADMIN: DELETE WHEEL
   DELETE /api/admin/wheels/:id
====================================================== */

router.delete("/admin/wheels/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel id",
      });
    }

    const wheel = await WheelReward.findById(req.params.id);

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    const spinHistoryExists = await WheelSpinHistory.exists({
      wheel: wheel._id,
    });

    if (spinHistoryExists) {
      return res.status(400).json({
        success: false,
        message:
          "This Wheel has Spin history. Deactivate it instead of deleting it.",
      });
    }

    await WheelReward.deleteOne({
      _id: wheel._id,
    });

    res.json({
      success: true,
      message: "Wheel deleted successfully",
    });
  } catch (err) {
    console.error("Delete Wheel error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
