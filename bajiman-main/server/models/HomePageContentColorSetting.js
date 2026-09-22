import mongoose from "mongoose";

const homePageContentColorSettingSchema = new mongoose.Schema(
  {
    pageBg: { type: String, default: "#f1f1f1", trim: true },

    sectionBg: { type: String, default: "transparent", trim: true },
    sectionTitleText: { type: String, default: "#111111", trim: true },
    sectionBarBg: { type: String, default: "#0b66a8", trim: true },

    cardBg: { type: String, default: "#ffffff", trim: true },
    cardBorder: { type: String, default: "transparent", trim: true },
    cardText: { type: String, default: "#111111", trim: true },
    cardHoverShadow: { type: String, default: "rgba(0,0,0,0.12)", trim: true },

    imageBoxBg: { type: String, default: "#0b4f83", trim: true },
    imagePlaceholderText: { type: String, default: "#ffffff", trim: true },

    skeletonBg: { type: String, default: "#e5e7eb", trim: true },

    buttonBg: { type: String, default: "#005eb8", trim: true },
    buttonText: { type: String, default: "#ffffff", trim: true },
    inactiveButtonBg: { type: String, default: "#ffffff", trim: true },
    inactiveButtonText: { type: String, default: "#333333", trim: true },

    inputBg: { type: String, default: "#ffffff", trim: true },
    inputText: { type: String, default: "#333333", trim: true },
    inputBorder: { type: String, default: "transparent", trim: true },
    inputFocusBorder: { type: String, default: "#005eb8", trim: true },

    emptyText: { type: String, default: "#555555", trim: true },

    paginationBg: { type: String, default: "#ffffff", trim: true },
    paginationText: { type: String, default: "#333333", trim: true },
    paginationDisabledOpacity: { type: String, default: "0.50", trim: true },

    accountOverlayBg: { type: String, default: "rgba(0,0,0,0.45)", trim: true },
    accountModalBg: { type: String, default: "#ffffff", trim: true },
    accountHeaderBg: { type: String, default: "#0865a9", trim: true },
    accountHeaderText: { type: String, default: "#ffffff", trim: true },
    accountHeaderCardBg: {
      type: String,
      default: "rgba(255,255,255,0.10)",
      trim: true,
    },

    accountAvatarBg: { type: String, default: "#e9b20d", trim: true },
    accountAvatarText: { type: String, default: "#ffffff", trim: true },
    accountMutedText: {
      type: String,
      default: "rgba(255,255,255,0.80)",
      trim: true,
    },

    accountBalanceBg: { type: String, default: "#eef4ff", trim: true },
    accountBalanceBorder: { type: String, default: "#97b6e9", trim: true },
    accountBalanceText: { type: String, default: "#0865a9", trim: true },
    accountBalanceMutedText: { type: String, default: "#2451cc", trim: true },

    accountPrimaryButtonBg: { type: String, default: "#0865a9", trim: true },
    accountPrimaryButtonText: { type: String, default: "#ffffff", trim: true },
    accountDangerButtonBg: { type: String, default: "#ef4444", trim: true },
    accountDangerButtonText: { type: String, default: "#ffffff", trim: true },

    accountSectionBg: { type: String, default: "#ffffff", trim: true },
    accountSectionBorder: { type: String, default: "#dce8f5", trim: true },
    accountSectionHeaderBg: { type: String, default: "#eef4ff", trim: true },
    accountSectionTitleText: { type: String, default: "#0865a9", trim: true },
    accountSectionBarBg: { type: String, default: "#0865a9", trim: true },

    accountIconBoxBg: { type: String, default: "#eaf4ff", trim: true },
    accountIconBoxText: { type: String, default: "#0865a9", trim: true },
    accountMenuText: { type: String, default: "#333333", trim: true },
    accountMenuHoverBg: { type: String, default: "#f7fbff", trim: true },

    accountLogoutBg: { type: String, default: "#e9b20d", trim: true },
    accountLogoutText: { type: String, default: "#ffffff", trim: true },

    accountLoadingBg: { type: String, default: "#eef4ff", trim: true },
    accountLoadingText: { type: String, default: "#0865a9", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

homePageContentColorSettingSchema.index({ status: 1, createdAt: -1 });

const HomePageContentColorSetting =
  mongoose.models.HomePageContentColorSetting ||
  mongoose.model(
    "HomePageContentColorSetting",
    homePageContentColorSettingSchema,
  );

export default HomePageContentColorSetting;
