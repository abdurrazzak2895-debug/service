import mongoose from "mongoose";

const SidebarColorSettingSchema = new mongoose.Schema(
  {
    desktopBg: { type: String, default: "#0b66a8", trim: true },
    desktopToggleBg: { type: String, default: "#075893", trim: true },
    desktopToggleText: { type: String, default: "#ffffff", trim: true },
    desktopToggleHoverBg: { type: String, default: "#1979c9", trim: true },

    desktopItemHoverBg: { type: String, default: "#1979c9", trim: true },
    desktopItemActiveBg: { type: String, default: "#37a2ff", trim: true },
    desktopItemActiveBorder: { type: String, default: "#ffffff", trim: true },

    desktopIconBg: { type: String, default: "#075893", trim: true },
    desktopIconText: { type: String, default: "#ffffff", trim: true },
    desktopActiveIconBg: { type: String, default: "#005fff", trim: true },
    desktopActiveIconText: { type: String, default: "#ffffff", trim: true },

    desktopExpandedText: { type: String, default: "#ffffff", trim: true },
    desktopExpandedIconBg: { type: String, default: "#075893", trim: true },
    desktopExpandedActiveBg: { type: String, default: "#37a2ff", trim: true },

    desktopChildBg: { type: String, default: "#f4f4f4", trim: true },
    desktopChildText: { type: String, default: "#111111", trim: true },
    desktopChildHoverBg: { type: String, default: "#ffffff", trim: true },
    desktopChildBorder: { type: String, default: "#d8d8d8", trim: true },

    mobileBg: { type: String, default: "#ffffff", trim: true },
    mobileText: { type: String, default: "#111111", trim: true },
    mobileItemHoverBg: { type: String, default: "#f7f7f7", trim: true },
    mobileItemActiveBg: { type: String, default: "#e8f4ff", trim: true },
    mobileItemActiveText: { type: String, default: "#0b66a8", trim: true },
    mobileIconText: { type: String, default: "#0b66a8", trim: true },

    mobileSectionText: { type: String, default: "#111111", trim: true },
    mobileSectionBorder: { type: String, default: "#d9e6f2", trim: true },

    mobilePanelBg: { type: String, default: "#f5f5f5", trim: true },
    mobilePanelBorder: { type: String, default: "#d9d9d9", trim: true },
    mobilePanelText: { type: String, default: "#222222", trim: true },
    mobilePanelHoverBg: { type: String, default: "#ffffff", trim: true },

    overlayBg: { type: String, default: "rgba(0,0,0,0.60)", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

SidebarColorSettingSchema.index({ status: 1, createdAt: -1 });

const SidebarColorSetting =
  mongoose.models.SidebarColorSetting ||
  mongoose.model("SidebarColorSetting", SidebarColorSettingSchema);

export default SidebarColorSetting;
