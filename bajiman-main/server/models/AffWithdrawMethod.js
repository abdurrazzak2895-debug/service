import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },

    label: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    placeholder: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    type: {
      type: String,
      enum: ["text", "number", "tel", "email"],
      default: "text",
    },

    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const AffWithdrawMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    logoUrl: { type: String, default: "" },

    minimumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    fields: {
      type: [FieldSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const AffWithdrawMethod =
  mongoose.models.AffWithdrawMethod ||
  mongoose.model("AffWithdrawMethod", AffWithdrawMethodSchema);

export default AffWithdrawMethod;