import mongoose from "mongoose";

const bottomNavigationColorSettingSchema = new mongoose.Schema(
  {
    beforeLoginBg: { type: String, default: "#ffffff", trim: true },
    beforeLoginBorder: { type: String, default: "#c9c9c9", trim: true },

    languageBoxBg: { type: String, default: "#dce8f2", trim: true },
    languageTitleText: { type: String, default: "#0b3554", trim: true },
    languageSubtitleText: { type: String, default: "#111111", trim: true },

    signupBg: { type: String, default: "#ffffff", trim: true },
    signupText: { type: String, default: "#111111", trim: true },

    loginBg: { type: String, default: "#0b66a8", trim: true },
    loginText: { type: String, default: "#ffffff", trim: true },

    afterLoginBgFrom: { type: String, default: "#051b2e", trim: true },
    afterLoginBgVia: { type: String, default: "#082f50", trim: true },
    afterLoginBgTo: { type: String, default: "#051b2e", trim: true },
    afterLoginBorder: {
      type: String,
      default: "rgba(255,255,255,0.10)",
      trim: true,
    },

    itemIconBg: { type: String, default: "rgba(255,255,255,0.10)", trim: true },
    itemIconText: {
      type: String,
      default: "rgba(255,255,255,0.85)",
      trim: true,
    },
    itemText: { type: String, default: "rgba(255,255,255,0.75)", trim: true },

    activeIconBg: { type: String, default: "#2e9bf3", trim: true },
    activeIconText: { type: String, default: "#ffffff", trim: true },
    activeText: { type: String, default: "#ffffff", trim: true },

    depositIconBgFrom: { type: String, default: "#2e9bf3", trim: true },
    depositIconBgTo: { type: String, default: "#0865a9", trim: true },
    depositIconText: { type: String, default: "#ffffff", trim: true },
    depositBadgeBg: { type: String, default: "#5ed51d", trim: true },
    depositBadgeText: { type: String, default: "#ffffff", trim: true },

    balanceBgFrom: { type: String, default: "#064b83", trim: true },
    balanceBgVia: { type: String, default: "#0b66a8", trim: true },
    balanceBgTo: { type: String, default: "#063f70", trim: true },
    balanceText: { type: String, default: "#ffffff", trim: true },
    balanceMutedText: {
      type: String,
      default: "rgba(255,255,255,0.70)",
      trim: true,
    },
    balanceIconBg: {
      type: String,
      default: "rgba(255,255,255,0.15)",
      trim: true,
    },
    balanceActionBg: {
      type: String,
      default: "rgba(255,255,255,0.10)",
      trim: true,
    },
    balanceActionText: { type: String, default: "#ffffff", trim: true },
    balanceAccentIcon: { type: String, default: "#ff4960", trim: true },
    balanceDivider: {
      type: String,
      default: "rgba(255,255,255,0.15)",
      trim: true,
    },

    langModalOverlayBg: {
      type: String,
      default: "rgba(0,0,0,0.50)",
      trim: true,
    },
    langModalBg: { type: String, default: "#ffffff", trim: true },
    langModalHeaderBg: { type: String, default: "#0b66a8", trim: true },
    langModalHeaderText: { type: String, default: "#ffffff", trim: true },
    langModalMutedText: {
      type: String,
      default: "rgba(255,255,255,0.80)",
      trim: true,
    },

    langOptionWrapperBg: { type: String, default: "#eef7ff", trim: true },
    langOptionBg: { type: String, default: "#ffffff", trim: true },
    langOptionText: { type: String, default: "#111111", trim: true },
    langOptionActiveBg: { type: String, default: "#0b66a8", trim: true },
    langOptionActiveText: { type: String, default: "#ffffff", trim: true },
    langOptionCheckBg: { type: String, default: "#ffffff", trim: true },
    langOptionCheckText: { type: String, default: "#0b66a8", trim: true },
    langOptionCheckBorder: { type: String, default: "#c9dff2", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

bottomNavigationColorSettingSchema.index({ status: 1, createdAt: -1 });

const BottomNavigationColorSetting =
  mongoose.models.BottomNavigationColorSetting ||
  mongoose.model(
    "BottomNavigationColorSetting",
    bottomNavigationColorSettingSchema,
  );

export default BottomNavigationColorSetting;
