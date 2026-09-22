import mongoose from "mongoose";

const I18nSchema = new mongoose.Schema(
  {
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
  { _id: false },
);

const WithdrawMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: I18nSchema,
      required: true,
      default: () => ({
        bn: "",
        en: "",
      }),
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    minimumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const WithdrawMethod =
  mongoose.models.WithdrawMethod ||
  mongoose.model("WithdrawMethod", WithdrawMethodSchema);

export default WithdrawMethod;
