import mongoose from "mongoose";

const { Schema } = mongoose;

const slideSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    alt: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateSliderSettingSchema = new Schema(
  {
    bgImage: { type: String, default: "", trim: true },

    slides: {
      type: [slideSchema],
      default: [],
    },

    autoPlay: { type: Boolean, default: true },
    interval: { type: Number, default: 4500, min: 1000 },

    sectionPaddingY: { type: String, default: "16px", trim: true },
    sectionPaddingYDesktop: { type: String, default: "40px", trim: true },

    dotActiveBg: { type: String, default: "#087cff", trim: true },
    dotInactiveBg: { type: String, default: "#151515", trim: true },
    dotHoverBg: { type: String, default: "#087cff", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateSliderSetting =
  mongoose.models.AffiliateSliderSetting ||
  mongoose.model("AffiliateSliderSetting", AffiliateSliderSettingSchema);

export default AffiliateSliderSetting;
