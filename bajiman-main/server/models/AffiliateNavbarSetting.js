import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const AffiliateNavbarSettingSchema = new Schema(
  {
    logo: {
      type: String,
      default: "",
      trim: true,
    },

    loginText: {
      type: localizedTextSchema,
      default: () => ({ bn: "প্রবেশ করুন", en: "Login" }),
    },

    registerText: {
      type: localizedTextSchema,
      default: () => ({ bn: "নিবন্ধন করুন", en: "Register" }),
    },

    selectLanguageText: {
      type: localizedTextSchema,
      default: () => ({
        bn: "ভাষা নির্বাচন করুন",
        en: "Select Language",
      }),
    },

    loginPath: { type: String, default: "/login", trim: true },
    registerPath: { type: String, default: "/register", trim: true },

    navbarBg: { type: String, default: "#dff8ff", trim: true },
    navbarBorderColor: { type: String, default: "#0b1f33", trim: true },
    textColor: { type: String, default: "#18344d", trim: true },

    loginButtonBg: { type: String, default: "#2069b7", trim: true },
    loginButtonHoverBg: { type: String, default: "#175ba3", trim: true },
    loginButtonBorderColor: { type: String, default: "#0e62b8", trim: true },

    registerButtonBg: { type: String, default: "#48b948", trim: true },
    registerButtonHoverBg: { type: String, default: "#37a937", trim: true },

    buttonTextColor: { type: String, default: "#ffffff", trim: true },

    contentMaxWidth: { type: String, default: "1500px", trim: true },
    navbarHeight: { type: String, default: "95px", trim: true },
    logoHeight: { type: String, default: "44px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateNavbarSetting =
  mongoose.models.AffiliateNavbarSetting ||
  mongoose.model("AffiliateNavbarSetting", AffiliateNavbarSettingSchema);

export default AffiliateNavbarSetting;
