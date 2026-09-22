import mongoose from "mongoose";

const LangTextSchema = new mongoose.Schema(
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
  { _id: false }
);

const PromotionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Welcome Offer",
        "Slots",
        "Live Casino",
        "Sports",
        "Fishing",
        "Lottery",
        "Table",
        "Arcade",
        "Crash",
      ],
      required: true,
      index: true,
    },

    title: {
      type: LangTextSchema,
      required: true,
    },

    description: {
      type: LangTextSchema,
      required: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

PromotionSchema.index({ category: 1, status: 1, order: 1 });

const Promotion =
  mongoose.models.Promotion || mongoose.model("Promotion", PromotionSchema);

export default Promotion;