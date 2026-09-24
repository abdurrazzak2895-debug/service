import mongoose from "mongoose";
import dotenv from "dotenv";
import Promotion from "../models/Promotion.js";

dotenv.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const IMG = "https://static.prod-images.emergentagent.com/jobs/40967c6c-9fd4-45f1-970c-7a219d69e691/images/";
const banner = {
  welcome: IMG + "f7111907ce61a8f107920d7cc805269c7a7a550e193080fb32fa7b0050c82c3a.jpeg",
  reload: IMG + "3c4eaf120f75bef93c37314b6527cc095916a919a1ff49106c016efe4134d152.jpeg",
  cashback: IMG + "080fc8f94108a773078b69fc24469d4be3db4921372b8a844bde2a5a31754914.jpeg",
};

const promotions = [
  {
    category: "Welcome Offer",
    title: { bn: "ওয়েলকাম বোনাস ১০০৳", en: "Welcome Bonus ৳100" },
    description: {
      bn: "প্রথম ডিপোজিটে ফ্রি ১০০৳ বোনাস। সর্বনিম্ন ডিপোজিট ১০০৳। টার্নওভার x৩।",
      en: "Get a free ৳100 bonus on your first deposit. Min deposit ৳100. Turnover x3.",
    },
    image: banner.welcome,
    order: 1,
    status: "active",
  },
  {
    category: "Slots",
    title: { bn: "রিলোড বোনাস +৫%", en: "Reload Bonus +5%" },
    description: {
      bn: "প্রতিদিনের ডিপোজিটে +৫% রিলোড বোনাস। টার্নওভার x৫।",
      en: "Enjoy +5% reload bonus on every daily deposit. Turnover x5.",
    },
    image: banner.reload,
    order: 2,
    status: "active",
  },
  {
    category: "Live Casino",
    title: { bn: "লাইভ ক্যাসিনো ক্যাশব্যাক ১০%", en: "Live Casino Cashback 10%" },
    description: {
      bn: "লাইভ ক্যাসিনোতে সাপ্তাহিক ১০% ক্যাশব্যাক। কোনো টার্নওভার নেই।",
      en: "Weekly 10% cashback on live casino losses. No turnover required.",
    },
    image: banner.cashback,
    order: 3,
    status: "active",
  },
  {
    category: "Sports",
    title: { bn: "স্পোর্টস ফার্স্ট ডিপোজিট +৮%", en: "Sports First Deposit +8%" },
    description: {
      bn: "স্পোর্টস বেটিং-এ প্রথম ডিপোজিটে +৮% বোনাস। টার্নওভার x৬।",
      en: "Get +8% bonus on your first sports betting deposit. Turnover x6.",
    },
    image: banner.reload,
    order: 4,
    status: "active",
  },
];

const run = async () => {
  await mongoose.connect(mongoUri);
  for (const p of promotions) {
    await Promotion.findOneAndUpdate(
      { "title.en": p.title.en },
      { $set: p },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  console.log("Seeded promotions:", await Promotion.countDocuments());
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
