import mongoose from "mongoose";

const gameApiKeySettingSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastVerifiedAt: {
      type: Date,
      default: null,
    },

    lastVerifyError: {
      type: String,
      default: "",
      trim: true,
    },

    siteInfo: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true },
);

const GameApiKeySetting =
  mongoose.models.GameApiKeySetting ||
  mongoose.model("GameApiKeySetting", gameApiKeySettingSchema);

export default GameApiKeySetting;
