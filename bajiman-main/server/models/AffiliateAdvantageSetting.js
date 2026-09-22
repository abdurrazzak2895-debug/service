import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const advantageCardSchema = new Schema(
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

const AffiliateAdvantageSettingSchema = new Schema(
  {
    sectionTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "ক্রিকেক্স সুবিধাসমূহ",
        en: "CRICKEX ADVANTAGE",
      }),
    },

    cards: {
      type: [advantageCardSchema],
      default: [],
    },

    sectionBg: { type: String, default: "transparent", trim: true },
    titleBoxBg: { type: String, default: "#e8f8ff", trim: true },
    titleColor: { type: String, default: "#17227a", trim: true },

    cardBg: { type: String, default: "#e8f8ff", trim: true },
    cardTitleColor: { type: String, default: "#002d68", trim: true },
    cardDescColor: { type: String, default: "#001d55", trim: true },

    contentMaxWidth: { type: String, default: "1425px", trim: true },
    iconSize: { type: String, default: "52px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateAdvantageSetting =
  mongoose.models.AffiliateAdvantageSetting ||
  mongoose.model("AffiliateAdvantageSetting", AffiliateAdvantageSettingSchema);

export default AffiliateAdvantageSetting;
