import mongoose from "mongoose";

const SiteIdentifySchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

const SiteIdentify =
  mongoose.models.SiteIdentify ||
  mongoose.model("SiteIdentify", SiteIdentifySchema);

export default SiteIdentify;