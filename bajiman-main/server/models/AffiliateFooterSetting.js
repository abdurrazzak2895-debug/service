import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const footerLinkSchema = new Schema(
  {
    label: {
      type: localizedTextSchema,
      default: () => ({ bn: "", en: "" }),
    },
    path: { type: String, default: "#", trim: true },
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
    name: { type: String, default: "", trim: true },
    icon: { type: String, default: "", trim: true },
    url: { type: String, default: "#", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateFooterSettingSchema = new Schema(
  {
    logo: { type: String, default: "", trim: true },

    links: { type: [footerLinkSchema], default: [] },
    socials: { type: [socialSchema], default: [] },

    followText: {
      type: localizedTextSchema,
      default: () => ({ bn: "ফলো করুন:", en: "FOLLOW US:" }),
    },

    signupText: {
      type: localizedTextSchema,
      default: () => ({
        bn: "আজই Crickex Affiliate-এ সাইন আপ করুন!",
        en: "Sign up today at Crickex Affiliate!",
      }),
    },

    signupButtonText: {
      type: localizedTextSchema,
      default: () => ({ bn: "সাইন আপ", en: "SIGN UP" }),
    },

    signupButtonPath: {
      type: String,
      default: "/register",
      trim: true,
    },

    copyrightText: {
      type: localizedTextSchema,
      default: () => ({
        bn: "©2026 Crickex. সর্বস্বত্ব সংরক্ষিত।",
        en: "©2026 Crickex. All Rights Reserved.",
      }),
    },

    footerBg: { type: String, default: "#dff8ff", trim: true },
    textColor: { type: String, default: "#07192c", trim: true },
    linkHoverColor: { type: String, default: "#176bb5", trim: true },
    buttonBg: { type: String, default: "#4bd914", trim: true },
    buttonHoverBg: { type: String, default: "#3ec40d", trim: true },
    buttonTextColor: { type: String, default: "#ffffff", trim: true },

    contentMaxWidth: { type: String, default: "1400px", trim: true },
    logoWidth: { type: String, default: "140px", trim: true },
    socialIconSize: { type: String, default: "48px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateFooterSetting =
  mongoose.models.AffiliateFooterSetting ||
  mongoose.model("AffiliateFooterSetting", AffiliateFooterSettingSchema);

export default AffiliateFooterSetting;
