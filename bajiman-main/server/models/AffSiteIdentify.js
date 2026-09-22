import mongoose from "mongoose";

const AffSiteIdentifySchema = new mongoose.Schema(
  {
    siteName: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    logoImage: {
      type: String,
      default: "",
      trim: true,
    },

    faviconImage: {
      type: String,
      default: "",
      trim: true,
    },

    backgroundImage: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffSiteIdentify =
  mongoose.models.AffSiteIdentify ||
  mongoose.model("AffSiteIdentify", AffSiteIdentifySchema);

export default AffSiteIdentify;
