// models/WheelReward.js

import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   MULTI-LANGUAGE TEXT
====================================================== */

const LanguageTextSchema = new Schema(
  {
    bn: {
      type: String,
      required: true,
      trim: true,
    },

    en: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* ======================================================
   WHEEL SEGMENT
====================================================== */

const WheelSegmentSchema = new Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    text: {
      type: LanguageTextSchema,
      required: true,
    },

    prizeType: {
      type: String,
      enum: ["balance", "reward_coin", "no_prize"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    turnoverMultiplier: {
      type: Number,
      default: 0,
      min: 0,
    },

    backgroundColor: {
      type: String,
      default: "#ffc800",
      trim: true,
    },

    textColor: {
      type: String,
      default: "#000000",
      trim: true,
    },

    textSize: {
      type: Number,
      default: 14,
      min: 8,
      max: 40,
    },

    fontWeight: {
      type: String,
      enum: ["normal", "medium", "semibold", "bold", "extrabold"],
      default: "bold",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  },
);

/* ======================================================
   WHEEL REWARD
====================================================== */

const WheelRewardSchema = new Schema(
  {
    backgroundImage: {
      type: String,
      required: true,
      trim: true,
    },

    wheelImage: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: LanguageTextSchema,
      required: true,
    },

    description: {
      bn: {
        type: String,
        default: "",
        trim: true,
      },

      en: {
        type: String,
        default: "",
        trim: true,
      },
    },

    spinButtonText: {
      bn: {
        type: String,
        default: "স্পিন",
        trim: true,
      },

      en: {
        type: String,
        default: "SPIN",
        trim: true,
      },
    },

    spinCost: {
      type: Number,
      required: true,
      min: 0,
    },

    segments: {
      type: [WheelSegmentSchema],
      default: [],
    },

    design: {
      pageBackgroundColor: {
        type: String,
        default: "#66005f",
        trim: true,
      },

      cardBackgroundColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      wheelBackgroundColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      wheelBorderColor: {
        type: String,
        default: "#d89d00",
        trim: true,
      },

      wheelBorderWidth: {
        type: Number,
        default: 8,
        min: 0,
        max: 40,
      },

      pointerColor: {
        type: String,
        default: "#ffc800",
        trim: true,
      },

      centerButtonColor: {
        type: String,
        default: "#ffc800",
        trim: true,
      },

      centerButtonTextColor: {
        type: String,
        default: "#000000",
        trim: true,
      },

      titleColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      descriptionColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      costBoxColor: {
        type: String,
        default: "#ffc800",
        trim: true,
      },

      costTextColor: {
        type: String,
        default: "#000000",
        trim: true,
      },
    },

    conditions: {
      dailySpinLimit: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalSpinLimit: {
        type: Number,
        default: 0,
        min: 0,
      },

      cooldownMinutes: {
        type: Number,
        default: 0,
        min: 0,
      },

      minimumDeposit: {
        type: Number,
        default: 0,
        min: 0,
      },

      minimumTurnover: {
        type: Number,
        default: 0,
        min: 0,
      },

      minimumGameLoss: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    startAt: {
      type: Date,
      default: null,
      index: true,
    },

    endAt: {
      type: Date,
      default: null,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ======================================================
   INDEXES
====================================================== */

WheelRewardSchema.index({
  isActive: 1,
  order: 1,
  createdAt: -1,
});

WheelRewardSchema.index({
  startAt: 1,
  endAt: 1,
  isActive: 1,
});

const WheelReward =
  mongoose.models.WheelReward || mongoose.model("WheelReward", WheelRewardSchema);

export default WheelReward;
