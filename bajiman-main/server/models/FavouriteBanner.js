import mongoose from "mongoose";

const FavouriteBannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
      trim: true,
    },

    link: {
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

FavouriteBannerSchema.index({ status: 1, order: 1 });

const FavouriteBanner =
  mongoose.models.FavouriteBanner ||
  mongoose.model("FavouriteBanner", FavouriteBannerSchema);

export default FavouriteBanner;