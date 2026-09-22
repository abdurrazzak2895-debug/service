import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    headerBg: { type: String, default: "#0b66a8", trim: true },
    headerShadow: { type: String, default: "rgba(0,0,0,0.12)", trim: true },

    signupBg: { type: String, default: "#5ed51d", trim: true },
    signupText: { type: String, default: "#ffffff", trim: true },
    signupHoverBg: { type: String, default: "#52c719", trim: true },

    loginBg: { type: String, default: "#247ccf", trim: true },
    loginText: { type: String, default: "#ffffff", trim: true },
    loginHoverBg: { type: String, default: "#1f72c0", trim: true },

    depositBg: { type: String, default: "#247ccf", trim: true },
    depositText: { type: String, default: "#ffffff", trim: true },
    depositHoverBg: { type: String, default: "#1f72c0", trim: true },

    walletBg: { type: String, default: "#5ed51d", trim: true },
    walletText: { type: String, default: "#ffffff", trim: true },
    walletHoverBg: { type: String, default: "#52c719", trim: true },

    profileIconBg: { type: String, default: "#ffffff", trim: true },
    profileIconColor: { type: String, default: "#0b66a8", trim: true },

    dropdownBg: { type: String, default: "#ffffff", trim: true },
    dropdownText: { type: String, default: "#333333", trim: true },
    dropdownHoverBg: { type: String, default: "#f7f7f7", trim: true },
    dropdownIconBg: { type: String, default: "#ec4899", trim: true },
    dropdownIconText: { type: String, default: "#ffffff", trim: true },

    logoutText: { type: String, default: "#d93636", trim: true },
    logoutIconBg: { type: String, default: "#d93636", trim: true },
    logoutHoverBg: { type: String, default: "#fff3f3", trim: true },

    languageModalHeaderBg: { type: String, default: "#0b66a8", trim: true },
    languageModalHeaderText: { type: String, default: "#ffffff", trim: true },
    languageActiveBg: { type: String, default: "#0b66a8", trim: true },
    languageActiveText: { type: String, default: "#ffffff", trim: true },
    languageInactiveBg: { type: String, default: "#ffffff", trim: true },
    languageInactiveText: { type: String, default: "#111111", trim: true },

    mobileMenuIconColor: { type: String, default: "#ffffff", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

colorSchema.index({ status: 1, createdAt: -1 });

const NavbarColorSetting =
  mongoose.models.NavbarColorSetting ||
  mongoose.model("NavbarColorSetting", colorSchema);

export default NavbarColorSetting;
