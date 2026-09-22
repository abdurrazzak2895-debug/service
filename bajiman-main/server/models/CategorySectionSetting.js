import mongoose from "mongoose";

const CategorySectionSettingSchema = new mongoose.Schema(
  {
    sectionBg: {
      type: String,
      default: "#0b66a8",
      trim: true,
    },
    navBg: {
      type: String,
      default: "#074b7f",
      trim: true,
    },
    activeItemBg: {
      type: String,
      default: "#0b66a8",
      trim: true,
    },
    inactiveItemBg: {
      type: String,
      default: "#074b7f",
      trim: true,
    },
    itemTextColor: {
      type: String,
      default: "#ffffff",
      trim: true,
    },
    activeBorderColor: {
      type: String,
      default: "#1fa7ff",
      trim: true,
    },

    hotImage: {
      type: String,
      default: "",
      trim: true,
    },
    sportsImage: {
      type: String,
      default: "",
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

CategorySectionSettingSchema.index({ status: 1, createdAt: -1 });

const CategorySectionSetting =
  mongoose.models.CategorySectionSetting ||
  mongoose.model("CategorySectionSetting", CategorySectionSettingSchema);

export default CategorySectionSetting;
