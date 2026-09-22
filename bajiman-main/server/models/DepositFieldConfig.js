import mongoose from "mongoose";

const TextBiSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

const DepositInputSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },

    label: {
      type: TextBiSchema,
      default: () => ({}),
    },

    placeholder: {
      type: TextBiSchema,
      default: () => ({}),
    },

    type: {
      type: String,
      enum: ["text", "number", "tel"],
      default: "text",
    },

    required: {
      type: Boolean,
      default: true,
    },

    minLength: {
      type: Number,
      default: 0,
    },

    maxLength: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const DepositFieldConfigSchema = new mongoose.Schema(
  {
    depositMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepositMethod",
      required: true,
      unique: true,
    },

    instructions: {
      type: TextBiSchema,
      default: () => ({}),
    },

    inputs: {
      type: [DepositInputSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const DepositFieldConfig =
  mongoose.models.DepositFieldConfig ||
  mongoose.model("DepositFieldConfig", DepositFieldConfigSchema);

export default DepositFieldConfig;
