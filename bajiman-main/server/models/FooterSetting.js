import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const paymentMethodSchema = new Schema(
  {
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

const socialSchema = new Schema(
  {
    label: { type: String, default: "", trim: true },
    iconText: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const sponsorSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },
    name: localizedTextSchema,
    sub: localizedTextSchema,
    year: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const ambassadorSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },
    name: localizedTextSchema,
    sub: localizedTextSchema,
    year: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const footerLinkSchema = new Schema(
  {
    title: localizedTextSchema,
    link: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const FooterSettingSchema = new Schema(
  {
    paymentTitle: {
      type: localizedTextSchema,
      default: () => ({ bn: "পেমেন্ট মেথডস", en: "Payment Methods" }),
    },

    socialTitle: {
      type: localizedTextSchema,
      default: () => ({ bn: "সোশ্যাল নেটওয়ার্কস", en: "Social Networks" }),
    },

    sponsorTitle: {
      type: localizedTextSchema,
      default: () => ({ bn: "স্পন্সর", en: "Sponsor" }),
    },

    officialPartnerTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "অফিশিয়াল পার্টনার",
        en: "Official Partner",
      }),
    },

    ambassadorTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "ব্র্যান্ড অ্যাম্বাসেডর",
        en: "Brand Ambassador",
      }),
    },

    descriptionTitle: {
      type: localizedTextSchema,
      default: () => ({ bn: "", en: "" }),
    },

    description: {
      type: localizedTextSchema,
      default: () => ({ bn: "", en: "" }),
    },

    readMoreText: {
      type: localizedTextSchema,
      default: () => ({ bn: "আরও পড়ুন", en: "Read More" }),
    },

    showLessText: {
      type: localizedTextSchema,
      default: () => ({ bn: "কম দেখুন", en: "Show Less" }),
    },

    footerQualityTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "সেরা মানের প্ল্যাটফর্ম",
        en: "Best Quality Platform",
      }),
    },

    footerLogo: { type: String, default: "", trim: true },

    copyrightText: {
      type: String,
      default: "© 2026 CRICKEX Copyrights. All Rights Reserved",
      trim: true,
    },

    officialPartnerImage: { type: String, default: "", trim: true },
    officialPartnerLink: { type: String, default: "", trim: true },

    paymentMethods: [paymentMethodSchema],
    socials: [socialSchema],
    sponsors: [sponsorSchema],
    ambassadors: [ambassadorSchema],
    links: [footerLinkSchema],

    footerBg: { type: String, default: "#ffffff", trim: true },
    footerText: { type: String, default: "#111111", trim: true },
    sectionTitleText: { type: String, default: "#111111", trim: true },

    dividerBg: { type: String, default: "#d6d6d6", trim: true },

    socialIconBg: { type: String, default: "#0b66a8", trim: true },
    socialIconText: { type: String, default: "#ffffff", trim: true },

    linkBorder: { type: String, default: "#0b66a8", trim: true },
    linkText: { type: String, default: "#005daa", trim: true },

    descriptionTitleText: { type: String, default: "#444444", trim: true },
    descriptionText: { type: String, default: "#999999", trim: true },

    readMoreButtonBg: { type: String, default: "#006bb6", trim: true },
    readMoreButtonText: { type: String, default: "#ffffff", trim: true },

    qualityTitleText: { type: String, default: "#005daa", trim: true },
    copyrightTextColor: { type: String, default: "#888888", trim: true },

    itemTitleText: { type: String, default: "#111111", trim: true },
    itemSubText: { type: String, default: "#111111", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

FooterSettingSchema.index({ status: 1, createdAt: -1 });

const FooterSetting =
  mongoose.models.FooterSetting ||
  mongoose.model("FooterSetting", FooterSettingSchema);

export default FooterSetting;
