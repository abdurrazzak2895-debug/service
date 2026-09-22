import mongoose from "mongoose";

const { Schema } = mongoose;

const rateSnapshotSchema = new Schema(
  {
    redeemPoint: {
      type: Number,
      default: 0,
    },

    redeemMoney: {
      type: Number,
      default: 0,
    },

    minimumRedeemAmount: {
      type: Number,
      default: 0,
    },

    maximumRedeemAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const referRedeemHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    pointsUsed: {
      type: Number,
      required: true,
      min: 0,
    },

    redeemAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    rateSnapshot: {
      type: rateSnapshotSchema,
      default: () => ({
        redeemPoint: 0,
        redeemMoney: 0,
        minimumRedeemAmount: 0,
        maximumRedeemAmount: 0,
      }),
    },

    balanceBefore: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    pointsBefore: {
      type: Number,
      default: 0,
    },

    pointsAfter: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
      index: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

referRedeemHistorySchema.index({ user: 1, createdAt: -1 });
referRedeemHistorySchema.index({ userId: 1, createdAt: -1 });
referRedeemHistorySchema.index({ status: 1, createdAt: -1 });
referRedeemHistorySchema.index({ createdAt: -1 });

const ReferRedeemHistory =
  mongoose.models.ReferRedeemHistory ||
  mongoose.model("ReferRedeemHistory", referRedeemHistorySchema);

export default ReferRedeemHistory;
