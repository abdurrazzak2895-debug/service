import mongoose from "mongoose";

const { Schema } = mongoose;

const pendingRegisterBonusSchema = new Schema(
  {
    bonusId: {
      type: Schema.Types.ObjectId,
      ref: "RegisterBonusSetting",
      default: null,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 0,
      min: 0,
    },

    isApplied: {
      type: Boolean,
      default: false,
      index: true,
    },

    appliedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 4,
      maxlength: 15,
    },

    userGamePlayName: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      minlength: 10,
      maxlength: 10,
      match: /^[a-z]{10}$/,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    countryCode: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "aff-user"],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    balance: {
      type: Number,
      default: 0,
    },

    rewardCoin: {
      type: Number,
      default: 0,
    },

    pendingRegisterBonus: {
      type: pendingRegisterBonusSchema,
      default: () => ({
        bonusId: null,
        amount: 0,
        turnoverMultiplier: 0,
        isApplied: false,
        appliedAt: null,
      }),
    },

    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },

    createdUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionBalance: {
      type: Number,
      default: 0,
    },

    gameLossCommission: {
      type: Number,
      default: 0,
    },

    depositCommission: {
      type: Number,
      default: 0,
    },

    referCommission: {
      type: Number,
      default: 0,
    },

    gameWinCommission: {
      type: Number,
      default: 0,
    },

    gameLossCommissionBalance: {
      type: Number,
      default: 0,
    },

    depositCommissionBalance: {
      type: Number,
      default: 0,
    },

    referCommissionBalance: {
      type: Number,
      default: 0,
    },

    gameWinCommissionBalance: {
      type: Number,
      default: 0,
    },

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ userGamePlayName: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ countryCode: 1, phone: 1 }, { unique: true });
userSchema.index({
  "pendingRegisterBonus.isApplied": 1,
  "pendingRegisterBonus.amount": 1,
});

const User = mongoose.model("User", userSchema);

export default User;
