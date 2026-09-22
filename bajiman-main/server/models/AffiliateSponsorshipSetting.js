import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const sponsorSchema = new Schema(
  {
    name: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateSponsorshipSettingSchema = new Schema(
  {
    title: {
      type: localizedTextSchema,
      default: () => ({
        bn: "প্রধান\nস্পনসরশিপ",
        en: "PRINCIPAL\nSPONSORSHIP",
      }),
    },

    sponsors: {
      type: [sponsorSchema],
      default: [],
    },

    sectionBg: { type: String, default: "#226f2d", trim: true },
    titleColor: { type: String, default: "#ffffff", trim: true },

    sectionPaddingY: { type: String, default: "20px", trim: true },
    contentMaxWidth: { type: String, default: "1250px", trim: true },
    sponsorImageHeight: { type: String, default: "105px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateSponsorshipSetting =
  mongoose.models.AffiliateSponsorshipSetting ||
  mongoose.model(
    "AffiliateSponsorshipSetting",
    AffiliateSponsorshipSettingSchema,
  );

export default AffiliateSponsorshipSetting;
