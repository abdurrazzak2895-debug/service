import mongoose from "mongoose";

const { Schema } = mongoose;

const AffiliateDepositCommissionSchema = new Schema(
  {
    affiliatorId: {
      type: String,
      default: "",
      trim: true,
    },

    affiliatorUserId: {
      type: String,
      default: "",
      trim: true,
    },

    percent: {
      type: Number,
      default: 0,
      min: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const SelectedBonusSchema = new Schema(
  {
    bonusId: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      bn: {
        type: String,
        default: "",
      },
      en: {
        type: String,
        default: "",
      },
    },

    bonusType: {
      type: String,
      enum: ["fixed", "percent", ""],
      default: "",
    },

    bonusScope: {
      type: String,
      enum: ["all-time", "first-deposit", ""],
      default: "",
    },

    bonusValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Snapshotted from the selected AutoDepositToken bonus's
    // eligibleProviders at deposit-create time — copied onto the TurnOver
    // doc when the webhook confirms payment.
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
  },
  { _id: false },
);

const CalcSchema = new Schema(
  {
    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    targetTurnover: {
      type: Number,
      default: 0,
      min: 0,
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
  { _id: false },
);

const AutoDepositSchema = new Schema(
  {
    userIdentity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },

    checkoutItems: {
      type: Object,
      default: {},
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    sessionCode: {
      type: String,
      default: "",
      trim: true,
    },

    bank: {
      type: String,
      default: "",
      trim: true,
    },

    footprint: {
      type: String,
      default: "",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    balanceAdded: {
      type: Boolean,
      default: false,
      index: true,
    },

    selectedBonus: {
      type: SelectedBonusSchema,
      default: () => ({
        bonusId: "",
        title: { bn: "", en: "" },
        bonusType: "",
        bonusScope: "",
        bonusValue: 0,
        bonusAmount: 0,
        turnoverMultiplier: 1,
        eligibleProviders: [],
      }),
    },

    calc: {
      type: CalcSchema,
      default: () => ({
        depositAmount: 0,
        bonusAmount: 0,
        creditedAmount: 0,
        turnoverMultiplier: 1,
        targetTurnover: 0,
        affiliateDepositCommission: {
          affiliatorId: "",
          affiliatorUserId: "",
          percent: 0,
          baseAmount: 0,
          commissionAmount: 0,
        },
      }),
    },
  },
  { timestamps: true },
);

AutoDepositSchema.index({ userIdentity: 1, createdAt: -1 });
AutoDepositSchema.index({ invoiceNumber: 1, status: 1 });

const AutoDeposit =
  mongoose.models.AutoDeposit ||
  mongoose.model("AutoDeposit", AutoDepositSchema);

export default AutoDeposit;
