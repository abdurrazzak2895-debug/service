import mongoose from "mongoose";

const EWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Kept for backward compatibility with existing rows only — wallets are
    // no longer scoped to one withdraw method, they're shared across all of
    // them (see eWalletRoutes.js).
    methodId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },

    walletType: {
      type: String,
      enum: ["personal", "agent", "merchant"],
      default: "personal",
      trim: true,
    },

    walletNumber: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // The one wallet auto-created from the user's own registration phone
    // number. Always available for withdraw, doesn't count against the
    // manual-add cap, and can't be edited or deleted by the user.
    isAutoRegistration: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

EWalletSchema.index({ user: 1, walletNumber: 1 }, { unique: true });
EWalletSchema.index({ user: 1, isDefault: 1 });

const EWallet =
  mongoose.models.EWallet || mongoose.model("EWallet", EWalletSchema);

export default EWallet;
