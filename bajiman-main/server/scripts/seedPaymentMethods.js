import mongoose from "mongoose";
import dotenv from "dotenv";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import WithdrawMethod from "../models/WithdrawMethod.js";

dotenv.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const depositMethods = [
  {
    methodId: "bkash",
    methodName: { bn: "বিকাশ", en: "bKash" },
    methodType: "agent",
    minDepositAmount: 100,
    maxDepositAmount: 30000,
    contacts: [
      { id: "bkash-1", label: { bn: "এজেন্ট", en: "Agent" }, number: "01700000011", isActive: true, sort: 0 },
    ],
    bonus: {
      turnoverMultiplier: 1,
      channels: [
        { id: "bkash-instant", name: { bn: "ইনস্ট্যান্ট", en: "Instant" }, tagText: "+0%", isActive: true },
        { id: "bkash-bonus", name: { bn: "বোনাস চ্যানেল", en: "Bonus" }, tagText: "+3%", bonusPercent: 3, isActive: true },
      ],
      promotions: [
        { id: "welcome-100", name: { bn: "ওয়েলকাম +১০০৳", en: "Welcome +৳100" }, bonusType: "fixed", bonusValue: 100, turnoverMultiplier: 3, isActive: true, sort: 1 },
        { id: "reload-5", name: { bn: "রিলোড +৫%", en: "Reload +5%" }, bonusType: "percent", bonusValue: 5, turnoverMultiplier: 5, isActive: true, sort: 2 },
      ],
    },
  },
  {
    methodId: "nagad",
    methodName: { bn: "নগদ", en: "Nagad" },
    methodType: "agent",
    minDepositAmount: 100,
    maxDepositAmount: 25000,
    contacts: [
      { id: "nagad-1", label: { bn: "এজেন্ট", en: "Agent" }, number: "01800000022", isActive: true, sort: 0 },
    ],
    bonus: {
      turnoverMultiplier: 1,
      channels: [
        { id: "nagad-instant", name: { bn: "ইনস্ট্যান্ট", en: "Instant" }, tagText: "+0%", isActive: true },
      ],
      promotions: [
        { id: "nagad-first", name: { bn: "ফার্স্ট ডিপোজিট +৮%", en: "First Deposit +8%" }, bonusType: "percent", bonusValue: 8, turnoverMultiplier: 6, isActive: true, sort: 1 },
      ],
    },
  },
  {
    methodId: "rocket",
    methodName: { bn: "রকেট", en: "Rocket" },
    methodType: "agent",
    minDepositAmount: 200,
    maxDepositAmount: 20000,
    contacts: [
      { id: "rocket-1", label: { bn: "এজেন্ট", en: "Agent" }, number: "01900000033", isActive: true, sort: 0 },
    ],
    bonus: {
      turnoverMultiplier: 1,
      channels: [
        { id: "rocket-instant", name: { bn: "ইনস্ট্যান্ট", en: "Instant" }, tagText: "+0%", isActive: true },
      ],
      promotions: [],
    },
  },
];

const withdrawMethods = [
  { methodId: "BKASH", name: { bn: "বিকাশ", en: "bKash" }, minimumWithdrawAmount: 500, maximumWithdrawAmount: 25000, isActive: true },
  { methodId: "NAGAD", name: { bn: "নগদ", en: "Nagad" }, minimumWithdrawAmount: 500, maximumWithdrawAmount: 25000, isActive: true },
  { methodId: "ROCKET", name: { bn: "রকেট", en: "Rocket" }, minimumWithdrawAmount: 500, maximumWithdrawAmount: 20000, isActive: true },
];

const run = async () => {
  await mongoose.connect(mongoUri);

  for (const m of depositMethods) {
    const { bonus, ...methodDoc } = m;
    const method = await DepositMethod.findOneAndUpdate(
      { methodId: m.methodId },
      { $set: { ...methodDoc, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await DepositBonusTurnover.findOneAndUpdate(
      { depositMethod: method._id },
      { $set: { depositMethod: method._id, ...bonus } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  for (const w of withdrawMethods) {
    await WithdrawMethod.findOneAndUpdate(
      { methodId: w.methodId },
      { $set: w },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  console.log("Seeded payment methods:", {
    deposit: await DepositMethod.countDocuments(),
    withdraw: await WithdrawMethod.countDocuments(),
    bonus: await DepositBonusTurnover.countDocuments(),
  });
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
