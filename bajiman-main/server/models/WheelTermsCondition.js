// models/WheelTermsCondition.js

import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   BANGLA AND ENGLISH TEXT
====================================================== */

const LanguageTextSchema = new Schema(
  {
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
  {
    _id: false,
  },
);

/* ======================================================
   WHEEL TERMS AND CONDITIONS
====================================================== */

const WheelTermsConditionSchema = new Schema(
  {
    /**
     * পুরো system-এ শুধু একটি document রাখার জন্য।
     */
    settingKey: {
      type: String,
      default: "wheel-terms-condition",
      unique: true,
      immutable: true,
      trim: true,
    },

    title: {
      type: LanguageTextSchema,
      required: true,
    },

    heading: {
      type: LanguageTextSchema,
      required: true,
    },

    content: {
      type: LanguageTextSchema,
      required: true,
    },

    /**
     * Client home page-এ ভাসমান launcher icon (শুধু home page-এ দেখাবে)।
     * ক্লিক করলে full Wheel of Fortune page-এ নিয়ে যাবে।
     */
    launcherIcon: {
      type: String,
      default: "",
    },

    design: {
      pageBackgroundColor: {
        type: String,
        default: "#172178",
        trim: true,
      },

      cardGradientFrom: {
        type: String,
        default: "#172b88",
        trim: true,
      },

      cardGradientTo: {
        type: String,
        default: "#4b4b4b",
        trim: true,
      },

      cardBorderColor: {
        type: String,
        default: "#5364ba",
        trim: true,
      },

      cardBorderWidth: {
        type: Number,
        default: 1,
        min: 0,
        max: 20,
      },

      cardBorderRadius: {
        type: Number,
        default: 18,
        min: 0,
        max: 60,
      },

      cardShadowColor: {
        type: String,
        default: "#000000",
        trim: true,
      },

      titleGradientFrom: {
        type: String,
        default: "#ffb65c",
        trim: true,
      },

      titleGradientTo: {
        type: String,
        default: "#c79b00",
        trim: true,
      },

      titleBorderColor: {
        type: String,
        default: "#f5ca24",
        trim: true,
      },

      titleTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      headingTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      contentTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      titleFontSize: {
        type: Number,
        default: 22,
        min: 12,
        max: 60,
      },

      headingFontSize: {
        type: Number,
        default: 15,
        min: 10,
        max: 50,
      },

      contentFontSize: {
        type: Number,
        default: 14,
        min: 10,
        max: 40,
      },

      contentLineHeight: {
        type: Number,
        default: 1.8,
        min: 1,
        max: 4,
      },

      maxWidth: {
        type: Number,
        default: 900,
        min: 300,
        max: 1800,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ======================================================
   INDEX
====================================================== */

WheelTermsConditionSchema.index({
  settingKey: 1,
  isActive: 1,
});

/* ======================================================
   MODEL
====================================================== */

const WheelTermsCondition =
  mongoose.models.WheelTermsCondition ||
  mongoose.model("WheelTermsCondition", WheelTermsConditionSchema);

export default WheelTermsCondition;
