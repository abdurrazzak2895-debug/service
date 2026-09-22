import mongoose from "mongoose";

const RegisterModalSettingSchema = new mongoose.Schema(
  {
    logo: { type: String, default: "", trim: true },

    sliderImages: [
      {
        image: { type: String, default: "", trim: true },
        order: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],

    overlayBg: { type: String, default: "rgba(0,0,0,0.45)", trim: true },
    modalBg: { type: String, default: "#ffffff", trim: true },
    headerBg: { type: String, default: "#0865a9", trim: true },
    headerText: { type: String, default: "#ffffff", trim: true },

    labelText: { type: String, default: "#222222", trim: true },
    inputBg: { type: String, default: "#eeeeee", trim: true },
    inputText: { type: String, default: "#111111", trim: true },
    inputBorder: { type: String, default: "#d7d7d7", trim: true },
    placeholderText: { type: String, default: "#8c98a3", trim: true },

    helperText: { type: String, default: "#758494", trim: true },
    helperIcon: { type: String, default: "#8d969b", trim: true },

    buttonBg: { type: String, default: "#0865a9", trim: true },
    buttonText: { type: String, default: "#ffffff", trim: true },
    buttonDisabledBg: { type: String, default: "#a6a6a6", trim: true },

    linkText: { type: String, default: "#0069b4", trim: true },
    footerText: { type: String, default: "#8d969b", trim: true },

    sliderDotActive: { type: String, default: "#0865a9", trim: true },
    sliderDotInactive: { type: String, default: "#cfd5da", trim: true },
    bannerBg: { type: String, default: "#0b66a8", trim: true },

    dropdownBg: { type: String, default: "#ffffff", trim: true },
    dropdownText: { type: String, default: "#111111", trim: true },
    dropdownBorder: { type: String, default: "#dddddd", trim: true },
    dropdownHoverBg: { type: String, default: "#f5f5f5", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

RegisterModalSettingSchema.index({ status: 1, createdAt: -1 });

const RegisterModalSetting =
  mongoose.models.RegisterModalSetting ||
  mongoose.model("RegisterModalSetting", RegisterModalSettingSchema);

export default RegisterModalSetting;