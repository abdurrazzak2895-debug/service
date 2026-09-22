import mongoose from "mongoose";

const transactionHistoryColorSettingSchema = new mongoose.Schema(
  {
    modalBg: { type: String, default: "#ffffff", trim: true },
    pageOverlayBg: { type: String, default: "rgba(0,0,0,0.45)", trim: true },

    headerBg: { type: String, default: "#0865a9", trim: true },
    headerText: { type: String, default: "#ffffff", trim: true },
    closeIconColor: { type: String, default: "#ffffff", trim: true },

    primaryBg: { type: String, default: "#0865a9", trim: true },
    primaryText: { type: String, default: "#ffffff", trim: true },

    secondaryBg: { type: String, default: "#2e9bf3", trim: true },
    secondaryText: { type: String, default: "#ffffff", trim: true },

    inactiveTabBg: { type: String, default: "#00518c", trim: true },
    inactiveTabText: { type: String, default: "#ffffff", trim: true },

    sectionBg: { type: String, default: "#f3f7fb", trim: true },
    sectionBorder: { type: String, default: "#e5e5e5", trim: true },
    sectionText: { type: String, default: "#0865a9", trim: true },

    cardBg: { type: String, default: "#ffffff", trim: true },
    cardBorder: { type: String, default: "#dce8f5", trim: true },

    inputBg: { type: String, default: "#eeeeee", trim: true },
    inputText: { type: String, default: "#222222", trim: true },
    inputBorder: { type: String, default: "#d7d7d7", trim: true },
    inputFocusBorder: { type: String, default: "#0865a9", trim: true },

    labelText: { type: String, default: "#333333", trim: true },
    normalText: { type: String, default: "#222222", trim: true },
    mutedText: { type: String, default: "#777777", trim: true },

    summaryBg: { type: String, default: "#f4f8ff", trim: true },
    summaryText: { type: String, default: "#0865a9", trim: true },

    progressBg: { type: String, default: "#0865a9", trim: true },
    progressTrackBg: { type: String, default: "#ffffff", trim: true },

    successBg: { type: String, default: "#dcfce7", trim: true },
    successText: { type: String, default: "#15803d", trim: true },

    warningBg: { type: String, default: "#fef9c3", trim: true },
    warningText: { type: String, default: "#a16207", trim: true },

    dangerBg: { type: String, default: "#fee2e2", trim: true },
    dangerText: { type: String, default: "#b91c1c", trim: true },

    disabledBg: { type: String, default: "#a6a6a6", trim: true },
    disabledText: { type: String, default: "#ffffff", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

transactionHistoryColorSettingSchema.index({ status: 1, createdAt: -1 });

const TransactionHistoryColorSetting =
  mongoose.models.TransactionHistoryColorSetting ||
  mongoose.model(
    "TransactionHistoryColorSetting",
    transactionHistoryColorSettingSchema,
  );

export default TransactionHistoryColorSetting;