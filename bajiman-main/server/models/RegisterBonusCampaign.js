import mongoose from "mongoose";

const TextBiSchema = new mongoose.Schema(
  {
    bn: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false },
);

// Each provider's percent is a dedicated minimum share of the turnover
// this campaign's bonus generates — see server/routes/callbackRoutes.js
// applyTurnoverProgress. Empty array = unrestricted.
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

const RegisterBonusCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: TextBiSchema,
      required: true,
    },

    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    eligibleProviders: {
      type: [EligibleProviderSchema],
      default: [],
    },

    endDate: {
      type: Date,
      required: true,
    },

    // Only one campaign can be "active" at a time (enforced at creation
    // time in the route, not here) — once endDate passes or an admin
    // closes it early, it moves to "closed" and stays there; a new
    // campaign is created instead of reopening it.
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    closedReason: {
      type: String,
      enum: ["", "expired", "manual"],
      default: "",
    },
  },
  { timestamps: true },
);

RegisterBonusCampaignSchema.index({ status: 1, endDate: 1 });
RegisterBonusCampaignSchema.index({ createdAt: -1 });

const RegisterBonusCampaign =
  mongoose.models.RegisterBonusCampaign ||
  mongoose.model("RegisterBonusCampaign", RegisterBonusCampaignSchema);

export default RegisterBonusCampaign;
