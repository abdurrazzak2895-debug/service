import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const AffiliateWatchSettingSchema = new Schema(
  {
    sectionTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "দেখুন ক্রিকেক্স অ্যাফিলিয়েট প্রোগ্রাম কীভাবে কাজ করে",
        en: "WATCH HOW CRICKEX AFFILIATE PROGRAM WORKS",
      }),
    },

    videoId: {
      type: String,
      default: "EP-NFy9IpK8",
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    sectionBg: { type: String, default: "transparent", trim: true },
    cardBg: { type: String, default: "#ffffff", trim: true },
    titleColor: { type: String, default: "#17227a", trim: true },
    videoBorderColor: { type: String, default: "#333333", trim: true },
    videoBg: { type: String, default: "#000000", trim: true },

    contentMaxWidth: { type: String, default: "1425px", trim: true },
    videoMaxWidth: { type: String, default: "920px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateWatchSetting =
  mongoose.models.AffiliateWatchSetting ||
  mongoose.model("AffiliateWatchSetting", AffiliateWatchSettingSchema);

export default AffiliateWatchSetting;
