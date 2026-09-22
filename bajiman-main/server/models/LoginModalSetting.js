import mongoose from "mongoose";

const LoginModalSettingSchema = new mongoose.Schema(
  {
    logo: { type: String, default: "", trim: true },

    overlayBg: { type: String, default: "rgba(0,0,0,0.45)", trim: true },
    modalBg: { type: String, default: "#ffffff", trim: true },
    headerBg: { type: String, default: "#0865a9", trim: true },
    headerText: { type: String, default: "#ffffff", trim: true },

    labelText: { type: String, default: "#333333", trim: true },
    inputBg: { type: String, default: "#eeeeee", trim: true },
    inputText: { type: String, default: "#222222", trim: true },
    inputBorder: { type: String, default: "#d7d7d7", trim: true },
    inputFocusBorder: { type: String, default: "#0a68b1", trim: true },
    placeholderText: { type: String, default: "#8c98a3", trim: true },

    iconText: { type: String, default: "#999999", trim: true },

    buttonBg: { type: String, default: "#0865a9", trim: true },
    buttonText: { type: String, default: "#ffffff", trim: true },
    buttonDisabledBg: { type: String, default: "#a6a6a6", trim: true },

    linkText: { type: String, default: "#0069b4", trim: true },
    footerText: { type: String, default: "#8d8d8d", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

LoginModalSettingSchema.index({ status: 1, createdAt: -1 });

const LoginModalSetting =
  mongoose.models.LoginModalSetting ||
  mongoose.model("LoginModalSetting", LoginModalSettingSchema);

export default LoginModalSetting;
