import mongoose from "mongoose";

const TextBiSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

// Each provider's percent is a dedicated minimum share of the turnover a
// deposit/promotion generates (not a wager-value multiplier) — see
// server/routes/callbackRoutes.js applyTurnoverProgress for how this is
// applied. Empty array = unrestricted (any provider counts in full).
const EligibleProviderSchema = new mongoose.Schema(
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

const ChannelSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: TextBiSchema,
      default: () => ({}),
    },

    tagText: {
      type: String,
      default: "+0%",
      trim: true,
    },

    bonusTitle: {
      type: TextBiSchema,
      default: () => ({}),
    },

    bonusPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const PromotionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: TextBiSchema,
      default: () => ({}),
    },

    bonusType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "fixed",
    },

    bonusValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    bonusScope: {
      type: String,
      enum: ["first-deposit", "all-time"],
      default: "all-time",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sort: {
      type: Number,
      default: 0,
    },

    // Overrides the deposit method's default eligibleProviders below when
    // this promotion is selected AND has its own non-empty list — leaving
    // this empty means the promotion just inherits the method's default
    // instead of silently becoming unrestricted.
    eligibleProviders: {
      type: [EligibleProviderSchema],
      default: [],
    },
  },
  { _id: false },
);

const DepositBonusTurnoverSchema = new mongoose.Schema(
  {
    depositMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepositMethod",
      required: true,
      unique: true,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Default eligible-provider config, used when a deposit uses only a
    // channel bonus (no specific promotion selected).
    eligibleProviders: {
      type: [EligibleProviderSchema],
      default: [],
    },

    channels: {
      type: [ChannelSchema],
      default: [],
    },

    promotions: {
      type: [PromotionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

DepositBonusTurnoverSchema.index({ "promotions.isActive": 1 });
DepositBonusTurnoverSchema.index({ "promotions.bonusScope": 1 });

const DepositBonusTurnover =
  mongoose.models.DepositBonusTurnover ||
  mongoose.model("DepositBonusTurnover", DepositBonusTurnoverSchema);

export default DepositBonusTurnover;
