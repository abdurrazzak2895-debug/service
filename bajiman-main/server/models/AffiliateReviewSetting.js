import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const reviewItemSchema = new Schema(
  {
    logo: { type: String, default: "", trim: true },

    reviewText: {
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

const AffiliateReviewSettingSchema = new Schema(
  {
    sectionTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "CRICKEX সম্পর্কে অন্যরা যা বলে",
        en: "WHAT OTHERS SAY ABOUT CRICKEX",
      }),
    },

    reviews: {
      type: [reviewItemSchema],
      default: [],
    },

    sectionBg: { type: String, default: "transparent", trim: true },

    cardGradientFrom: { type: String, default: "#3d80c8", trim: true },
    cardGradientVia: { type: String, default: "#479e95", trim: true },
    cardGradientTo: { type: String, default: "#50cf31", trim: true },

    titleColor: { type: String, default: "#ffffff", trim: true },
    reviewCardBg: { type: String, default: "#ffffff", trim: true },
    reviewTextColor: { type: String, default: "#02066e", trim: true },

    navBorderColor: { type: String, default: "#ffffff", trim: true },
    navTextColor: { type: String, default: "#ffffff", trim: true },
    navHoverBg: { type: String, default: "#ffffff", trim: true },
    navHoverTextColor: { type: String, default: "#236cb5", trim: true },

    contentMaxWidth: { type: String, default: "1425px", trim: true },

    autoplayDelay: { type: Number, default: 3500, min: 500 },
    slideSpeed: { type: Number, default: 850, min: 100 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateReviewSetting =
  mongoose.models.AffiliateReviewSetting ||
  mongoose.model("AffiliateReviewSetting", AffiliateReviewSettingSchema);

export default AffiliateReviewSetting;