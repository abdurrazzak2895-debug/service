import mongoose from "mongoose";

const AffiliateDepositCommissionSchema = new mongoose.Schema(
  {
    affiliatorId: {
      type: String,
      default: "",
    },

    affiliatorUserId: {
      type: String,
      default: "",
    },

    percent: {
      type: Number,
      default: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
    },

    commissionAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const DepositRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    methodId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    channelId: {
      type: String,
      required: true,
      trim: true,
    },

    promoId: {
      type: String,
      default: "none",
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    fields: {
      type: Object,
      default: {},
    },

    calc: {
      channelPercent: { type: Number, default: 0 },
      percentBonus: { type: Number, default: 0 },
      promoBonus: { type: Number, default: 0 },
      totalBonus: { type: Number, default: 0 },

      turnoverMultiplier: { type: Number, default: 1 },
      targetTurnover: { type: Number, default: 0 },
      creditedAmount: { type: Number, default: 0 },

      // Snapshotted eligible-provider config (promo override or the
      // deposit method's default) at submission time — copied onto the
      // TurnOver doc when this request is approved.
      eligibleProviders: {
        type: [
          {
            _id: false,
            providerCode: { type: String, uppercase: true, trim: true },
            percent: { type: Number, default: 100, min: 0, max: 100 },
          },
        ],
        default: [],
      },

      affiliateDepositCommission: {
        type: AffiliateDepositCommissionSchema,
        default: () => ({
          affiliatorId: "",
          affiliatorUserId: "",
          percent: 0,
          baseAmount: 0,
          commissionAmount: 0,
        }),
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminNote: {
      type: String,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    display: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

DepositRequestSchema.index({ createdAt: -1 });
DepositRequestSchema.index({ user: 1, createdAt: -1 });
DepositRequestSchema.index({ status: 1, createdAt: -1 });

const DepositRequest =
  mongoose.models.DepositRequest ||
  mongoose.model("DepositRequest", DepositRequestSchema);

export default DepositRequest;
