import mongoose from "mongoose";

const WalletSnapshotSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    methodName: {
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

    walletType: {
      type: String,
      default: "",
      trim: true,
    },

    walletNumber: {
      type: String,
      default: "",
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const WithdrawRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    methodId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EWallet",
      required: true,
    },

    walletSnapshot: {
      type: WalletSnapshotSchema,
      default: () => ({
        methodId: "",
        methodName: {
          bn: "",
          en: "",
        },
        walletType: "",
        walletNumber: "",
        label: "",
      }),
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    balanceBefore: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

WithdrawRequestSchema.index({ user: 1, createdAt: -1 });
WithdrawRequestSchema.index({ status: 1, createdAt: -1 });
WithdrawRequestSchema.index({ methodId: 1, createdAt: -1 });

const WithdrawRequest =
  mongoose.models.WithdrawRequest ||
  mongoose.model("WithdrawRequest", WithdrawRequestSchema);

export default WithdrawRequest;
