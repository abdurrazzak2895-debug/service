import mongoose from "mongoose";

const LangTextSchema = new mongoose.Schema(
  {
    bn: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const GameCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: LangTextSchema,
      required: true,
    },

    categoryTitle: {
      type: LangTextSchema,
      required: true,
    },

    iconImage: {
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

GameCategorySchema.index({ status: 1, order: 1 });

const GameCategory =
  mongoose.models.GameCategory ||
  mongoose.model("GameCategory", GameCategorySchema);

export default GameCategory;