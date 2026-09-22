import mongoose from "mongoose";

// Singleton: admin-managed OTP SMS API key, plus a per-flow on/off toggle
// so OTP can be required for some flows (e.g. register) and skipped for
// others (e.g. withdraw) without touching code.
const OtpSettingSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      default: "",
      trim: true,
    },

    registerEnabled: {
      type: Boolean,
      default: true,
    },

    forgotPasswordEnabled: {
      type: Boolean,
      default: true,
    },

    withdrawEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const OtpSetting =
  mongoose.models.OtpSetting || mongoose.model("OtpSetting", OtpSettingSchema);

export default OtpSetting;
