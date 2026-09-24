import mongoose from "mongoose";
import dotenv from "dotenv";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import WithdrawMethod from "../models/WithdrawMethod.js";

dotenv.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const IMG = "https://static.prod-images.emergentagent.com/jobs/40967c6c-9fd4-45f1-970c-7a219d69e691/images/";
const logo = {
  bkash: IMG + "d6c4a5cc9a1d0ed49b608a1ef1886743b03d72fa4e6e277b2d5886181346500d.jpeg",
  nagad: IMG + "ec560c931219f80c95090941f998e45119b351d5e6776f73415532ca65148717.jpeg",
  rocket: IMG + "14e150c86c27942c86b989967a4ab019c3c7864ae85d1823bdc86a0640962a3e.jpeg",
};

const depositMethods = [
  {
    methodId: "bkash",
    methodName: { bn: "বিকাশ", en: "bKash" },
    methodType: "agent",
    logoUrl: logo.bkash,
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
    logoUrl: logo.nagad,
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
    logoUrl: logo.rocket,
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
  { methodId: "BKASH", name: { bn: "বিকাশ", en: "bKash" }, logoUrl: logo.bkash, minimumWithdrawAmount: 500, maximumWithdrawAmount: 25000, isActive: true },
  { methodId: "NAGAD", name: { bn: "নগদ", en: "Nagad" }, logoUrl: logo.nagad, minimumWithdrawAmount: 500, maximumWithdrawAmount: 25000, isActive: true },
  { methodId: "ROCKET", name: { bn: "রকেট", en: "Rocket" }, logoUrl: logo.rocket, minimumWithdrawAmount: 500, maximumWithdrawAmount: 20000, isActive: true },
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
