import mongoose from "mongoose";

const AffiliateSocialLinkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
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

AffiliateSocialLinkSchema.index({
  order: 1,
  createdAt: -1,
});

const AffiliateSocialLink =
  mongoose.models.AffiliateSocialLink ||
  mongoose.model("AffiliateSocialLink", AffiliateSocialLinkSchema);

export default AffiliateSocialLink;
