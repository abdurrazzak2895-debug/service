import mongoose from "mongoose";

const { Schema } = mongoose;

const referRedeemSettingSchema = new Schema(
  {
    referAmountForAllUsers: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumRedeemAmount: {
      type: Number,
      default: 100,
      min: 0,
    },

    maximumRedeemAmount: {
      type: Number,
      default: 1000,
      min: 0,
    },

    redeemPoint: {
      type: Number,
      default: 1000,
      min: 1,
    },

    redeemMoney: {
      type: Number,
      default: 100,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

referRedeemSettingSchema.index({ createdAt: 1 });

const ReferRedeemSetting =
  mongoose.models.ReferRedeemSetting ||
  mongoose.model("ReferRedeemSetting", referRedeemSettingSchema);

export default ReferRedeemSetting;