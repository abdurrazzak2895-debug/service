import mongoose from "mongoose";

const modalColorSchema = new mongoose.Schema(
  {
    modalBg: { type: String, default: "#ffffff", trim: true },
    pageOverlayBg: { type: String, default: "rgba(0,0,0,0.45)", trim: true },

    headerBg: { type: String, default: "#0865a9", trim: true },
    headerText: { type: String, default: "#ffffff", trim: true },
    closeIconColor: { type: String, default: "#ffffff", trim: true },

    primaryBg: { type: String, default: "#0865a9", trim: true },
    primaryText: { type: String, default: "#ffffff", trim: true },
    primaryHoverBg: { type: String, default: "#075894", trim: true },

    secondaryBg: { type: String, default: "#2e9bf3", trim: true },
    secondaryText: { type: String, default: "#ffffff", trim: true },

    inactiveTabBg: { type: String, default: "#00518c", trim: true },
    inactiveTabText: { type: String, default: "#ffffff", trim: true },

    promotionBg: { type: String, default: "#e9b20d", trim: true },
    promotionText: { type: String, default: "#ffffff", trim: true },

    sectionBg: { type: String, default: "#eef4ff", trim: true },
    sectionBorder: { type: String, default: "#97b6e9", trim: true },
    sectionText: { type: String, default: "#2451cc", trim: true },

    cardBg: { type: String, default: "#ffffff", trim: true },
    cardBorder: { type: String, default: "#d7d7d7", trim: true },

    inputBg: { type: String, default: "#eeeeee", trim: true },
    inputText: { type: String, default: "#222222", trim: true },
    inputBorder: { type: String, default: "#d7d7d7", trim: true },
    inputFocusBorder: { type: String, default: "#0865a9", trim: true },

    labelText: { type: String, default: "#333333", trim: true },
    normalText: { type: String, default: "#333333", trim: true },
    mutedText: { type: String, default: "#777777", trim: true },

    summaryBg: { type: String, default: "#eef7ff", trim: true },
    summaryText: { type: String, default: "#0865a9", trim: true },

    disabledBg: { type: String, default: "#a6a6a6", trim: true },
    disabledText: { type: String, default: "#ffffff", trim: true },

    dangerBg: { type: String, default: "#e95b5b", trim: true },
    dangerText: { type: String, default: "#ffffff", trim: true },

    successBg: { type: String, default: "#22c55e", trim: true },
    successText: { type: String, default: "#ffffff", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

modalColorSchema.index({ status: 1, createdAt: -1 });

const ModalColorSetting =
  mongoose.models.ModalColorSetting ||
  mongoose.model("ModalColorSetting", modalColorSchema);

export default ModalColorSetting;