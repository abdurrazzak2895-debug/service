import mongoose from "mongoose";

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const flowItemSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },
    text: localizedTextSchema,
    operatorAfter: {
      type: String,
      enum: ["none", "-", "="],
      default: "none",
    },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const tableRowSchema = new Schema(
  {
    activePlayers: localizedTextSchema,
    playerLoss: { type: String, default: "", trim: true },
    commission: { type: String, default: "", trim: true },
    rowBg: { type: String, default: "#b9efff", trim: true },
    textColor: { type: String, default: "#333333", trim: true },
    order: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { _id: true },
);

const AffiliateCommissionSettingSchema = new Schema(
  {
    flowTitle: {
      type: localizedTextSchema,
      default: () => ({ bn: "কমিশন ফ্লো", en: "COMMISSION FLOW" }),
    },

    tableHeadActivePlayers: {
      type: localizedTextSchema,
      default: () => ({ bn: "অ্যাকটিভ প্লেয়ার", en: "ACTIVE PLAYERS" }),
    },
    tableHeadPlayerLoss: {
      type: localizedTextSchema,
      default: () => ({ bn: "প্লেয়ার লস", en: "PLAYER LOSS" }),
    },
    tableHeadCommission: {
      type: localizedTextSchema,
      default: () => ({ bn: "কমিশন ৫০%", en: "COMMISSION 50%" }),
    },

    flowItems: { type: [flowItemSchema], default: [] },
    tableRows: { type: [tableRowSchema], default: [] },

    sectionBg: { type: String, default: "transparent", trim: true },
    cardBg: { type: String, default: "#edf5fa", trim: true },
    titleColor: { type: String, default: "#192075", trim: true },
    flowTextColor: { type: String, default: "#303030", trim: true },
    operatorColor: { type: String, default: "#3a3a3a", trim: true },

    headerGradientFrom: { type: String, default: "#1c5d9e", trim: true },
    headerGradientTo: { type: String, default: "#4add13", trim: true },
    headerTextColor: { type: String, default: "#ffffff", trim: true },
    bottomBarBg: { type: String, default: "#4ad022", trim: true },

    contentMaxWidth: { type: String, default: "1425px", trim: true },
    flowImageSize: { type: String, default: "76px", trim: true },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

const AffiliateCommissionSetting =
  mongoose.models.AffiliateCommissionSetting ||
  mongoose.model(
    "AffiliateCommissionSetting",
    AffiliateCommissionSettingSchema,
  );

export default AffiliateCommissionSetting;
