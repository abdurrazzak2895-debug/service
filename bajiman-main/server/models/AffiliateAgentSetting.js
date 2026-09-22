import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const AffiliateAgentSettingSchema = new Schema(
  {
    backgroundImage: { type: String, default: "", trim: true },
    rightImage: { type: String, default: "", trim: true },

    topText: {
      type: localizedTextSchema,
      default: () => ({
        bn: "ক্রিকেক্স এজেন্ট হতে",
        en: "Become a Crickex Agent",
      }),
    },
    title: {
      type: localizedTextSchema,
      default: () => ({ bn: "আবেদন করুন", en: "Apply Now" }),
    },
    line1: {
      type: localizedTextSchema,
      default: () => ({
        bn: "এখানেই আপনার সাফল্য!",
        en: "Your success starts here!",
      }),
    },
    line2: {
      type: localizedTextSchema,
      default: () => ({
        bn: "সরাসরি উপার্জন করুন ৫০% কমিশন আজীবন।",
        en: "Earn directly with 50% lifetime commission.",
      }),
    },
    buttonText: {
      type: localizedTextSchema,
      default: () => ({ bn: "এখনই যোগদিন", en: "Join Now" }),
    },

    buttonLink: { type: String, default: "", trim: true },

    topBg: { type: String, default: "#ffffff", trim: true },
    topTextColor: { type: String, default: "#0067bd", trim: true },
    titleColor: { type: String, default: "#32e414", trim: true },
    lineColor: { type: String, default: "#ffffff", trim: true },
    buttonBg: { type: String, default: "#42ea08", trim: true },
    buttonTextColor: { type: String, default: "#0067bd", trim: true },
    buttonIconBg: { type: String, default: "#d2cc27", trim: true },
    buttonIconColor: { type: String, default: "#ffffff", trim: true },

    sectionMinHeight: { type: String, default: "515px", trim: true },
    contentMaxWidth: { type: String, default: "1400px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateAgentSetting =
  mongoose.models.AffiliateAgentSetting ||
  mongoose.model("AffiliateAgentSetting", AffiliateAgentSettingSchema);

export default AffiliateAgentSetting;
