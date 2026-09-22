import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    text: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    sectionBg: {
      type: String,
      default: "#0B66A8",
      trim: true,
    },

    desktopSectionBg: {
      type: String,
      default: "transparent",
      trim: true,
    },

    iconColor: {
      type: String,
      default: "#ffffff",
      trim: true,
    },

    desktopIconColor: {
      type: String,
      default: "#4b5563",
      trim: true,
    },

    textColor: {
      type: String,
      default: "#ffffff",
      trim: true,
    },

    desktopTextColor: {
      type: String,
      default: "#444444",
      trim: true,
    },

    skeletonBg: {
      type: String,
      default: "rgba(255,255,255,0.4)",
      trim: true,
    },

    desktopSkeletonBg: {
      type: String,
      default: "#d1d5db",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

NoticeSchema.index({ status: 1, createdAt: -1 });

const Notice = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);

export default Notice;
