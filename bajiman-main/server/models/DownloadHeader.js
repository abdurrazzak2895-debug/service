// models/DownloadHeader.js
import mongoose from "mongoose";

const downloadHeaderSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: true },

    appNameBn: { type: String, default: "APP" },
    appNameEn: { type: String, default: "APP" },

    titleBn: { type: String, default: "" }, // optional override
    titleEn: { type: String, default: "" },

    btnTextBn: { type: String, default: "ডাউনলোড" },
    btnTextEn: { type: String, default: "Download" },

    iconUrl: { type: String, default: "" }, // /uploads/icon.png
    apkUrl: { type: String, default: "" }, // /uploads/app.apk
  },
  { timestamps: true },
);

downloadHeaderSchema.statics.getDefault = function () {
  return {
    isActive: true,
    appNameBn: "BAJIMAN",
    appNameEn: "BAJIMAN",
    titleBn: "",
    titleEn: "",
    btnTextBn: "ডাউনলোড",
    btnTextEn: "Download",
    iconUrl: "",
    apkUrl: "",
  };
};

const DownloadHeader =
  mongoose.models.DownloadHeader ||
  mongoose.model("DownloadHeader", downloadHeaderSchema);

export default DownloadHeader;
