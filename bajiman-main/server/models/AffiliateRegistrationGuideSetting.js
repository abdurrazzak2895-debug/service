import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const guideCardSchema = new Schema(
  {
    icon: { type: String, default: "", trim: true },

    title: {
      type: localizedTextSchema,
      default: () => ({ bn: "", en: "" }),
    },

    description: {
      type: localizedTextSchema,
      default: () => ({ bn: "", en: "" }),
    },

    order: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateRegistrationGuideSettingSchema = new Schema(
  {
    sectionTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "রেজিস্ট্রেশন গাইড",
        en: "REGISTRATION GUIDE",
      }),
    },

    cards: {
      type: [guideCardSchema],
      default: [],
    },

    sectionBg: { type: String, default: "transparent", trim: true },
    titleBoxBg: { type: String, default: "#e8f8ff", trim: true },
    titleColor: { type: String, default: "#17227a", trim: true },

    cardBg: { type: String, default: "#dff8ff", trim: true },
    iconCircleBg: { type: String, default: "#ffffff", trim: true },
    cardTitleColor: { type: String, default: "#002d68", trim: true },
    cardDescColor: { type: String, default: "#5f607e", trim: true },

    contentMaxWidth: { type: String, default: "1425px", trim: true },
    iconCircleSize: { type: String, default: "150px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateRegistrationGuideSetting =
  mongoose.models.AffiliateRegistrationGuideSetting ||
  mongoose.model(
    "AffiliateRegistrationGuideSetting",
    AffiliateRegistrationGuideSettingSchema,
  );

export default AffiliateRegistrationGuideSetting;
