import mongoose from "mongoose";

const { Schema } = mongoose;

// Each provider's percent is a dedicated minimum share of the turnover
// this bonus generates (not a wager-value multiplier) — see
// server/routes/callbackRoutes.js applyTurnoverProgress. Empty array =
// unrestricted (any provider counts in full).
const EligibleProviderSchema = new Schema(
  {
    providerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    percent: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

const BonusSchema = new Schema(
  {
    title: {
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

    bonusType: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
      default: "fixed",
    },

    bonusValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    turnoverMultiplier: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    bonusScope: {
      type: String,
      enum: ["all-time", "first-deposit"],
      default: "all-time",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    eligibleProviders: {
      type: [EligibleProviderSchema],
      default: [],
    },
  },
  { _id: true },
);

const AutoDepositTokenSchema = new Schema(
  {
    businessToken: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    minAmount: {
      type: Number,
      default: 5,
      min: 1,
    },

    maxAmount: {
      type: Number,
      default: 500000,
      min: 0,
    },

    bonuses: {
      type: [BonusSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const AutoDepositToken =
  mongoose.models.AutoDepositToken ||
  mongoose.model("AutoDepositToken", AutoDepositTokenSchema);

export default AutoDepositToken;
