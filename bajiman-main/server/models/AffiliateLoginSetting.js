import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const featureSchema = new Schema(
  {
    text: localizedTextSchema,
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateLoginSettingSchema = new Schema(
  {
    logo: { type: String, default: "", trim: true },

    badgeText: {
      type: localizedTextSchema,
      default: () => ({ bn: "ক্রিকেক্স অ্যাফিলিয়েট", en: "Crickex Affiliate" }),
    },
    title: {
      type: localizedTextSchema,
      default: () => ({ bn: "অ্যাফিলিয়েট লগইন", en: "Affiliate Login" }),
    },
    subTitle: {
      type: localizedTextSchema,
      default: () => ({
        bn: "আপনার অ্যাফিলিয়েট ড্যাশবোর্ডে প্রবেশ করুন।",
        en: "Access your affiliate dashboard securely.",
      }),
    },

    usernameLabel: {
      type: localizedTextSchema,
      default: () => ({ bn: "ইউজারনেম", en: "Username" }),
    },
    passwordLabel: {
      type: localizedTextSchema,
      default: () => ({ bn: "পাসওয়ার্ড", en: "Password" }),
    },
    validationCodeLabel: {
      type: localizedTextSchema,
      default: () => ({ bn: "ভ্যালিডেশন কোড", en: "Validation Code" }),
    },

    loginText: {
      type: localizedTextSchema,
      default: () => ({ bn: "লগইন করুন", en: "Login" }),
    },
    loggingInText: {
      type: localizedTextSchema,
      default: () => ({ bn: "লগইন হচ্ছে...", en: "Logging in..." }),
    },
    noAccountText: {
      type: localizedTextSchema,
      default: () => ({ bn: "অ্যাকাউন্ট নেই?", en: "Don’t have an account?" }),
    },
    registerText: {
      type: localizedTextSchema,
      default: () => ({ bn: "রেজিস্টার করুন", en: "Register" }),
    },
    forgotText: {
      type: localizedTextSchema,
      default: () => ({ bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot password?" }),
    },

    features: {
      type: [featureSchema],
      default: () => [
        { text: { bn: "নিরাপদ লগইন", en: "Secure Login" }, order: 0 },
        { text: { bn: "লাইফটাইম কমিশন", en: "Lifetime Commission" }, order: 1 },
        { text: { bn: "দ্রুত সাপোর্ট", en: "Fast Support" }, order: 2 },
      ],
    },

    pageBg: { type: String, default: "#061532", trim: true },
    leftCardBg: { type: String, default: "rgba(255,255,255,0.05)", trim: true },
    leftCardBorder: {
      type: String,
      default: "rgba(255,255,255,0.10)",
      trim: true,
    },

    badgeBg: { type: String, default: "#ffcc18", trim: true },
    badgeTextColor: { type: String, default: "#061532", trim: true },
    titleColor: { type: String, default: "#ffffff", trim: true },
    subTitleColor: {
      type: String,
      default: "rgba(255,255,255,0.75)",
      trim: true,
    },

    featureBg: { type: String, default: "#0c2c62", trim: true },
    featureTextColor: { type: String, default: "#ffffff", trim: true },

    formCardBg: { type: String, default: "#ffffff", trim: true },
    formTextColor: { type: String, default: "#111111", trim: true },
    formTitleColor: { type: String, default: "#061532", trim: true },

    labelColor: { type: String, default: "#061532", trim: true },
    inputBg: { type: String, default: "#f4f7fb", trim: true },
    inputBorder: { type: String, default: "#d9e2ef", trim: true },
    inputFocusBorder: { type: String, default: "#ffcc18", trim: true },
    inputIconColor: { type: String, default: "#0b66a8", trim: true },

    captchaBg: { type: String, default: "#061532", trim: true },
    captchaBorder: { type: String, default: "#ffcc18", trim: true },
    captchaTextColor: { type: String, default: "#ffcc18", trim: true },

    refreshBg: { type: String, default: "#ffcc18", trim: true },
    refreshTextColor: { type: String, default: "#061532", trim: true },

    submitBg: { type: String, default: "#ffcc18", trim: true },
    submitTextColor: { type: String, default: "#061532", trim: true },

    forgotLinkColor: { type: String, default: "#0b66a8", trim: true },
    registerLinkColor: { type: String, default: "#0b66a8", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateLoginSetting =
  mongoose.models.AffiliateLoginSetting ||
  mongoose.model("AffiliateLoginSetting", AffiliateLoginSettingSchema);

export default AffiliateLoginSetting;
