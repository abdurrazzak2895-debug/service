import mongoose from "mongoose";
import dotenv from "dotenv";
import Slider from "../models/Slider.js";

dotenv.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const IMG = "https://static.prod-images.emergentagent.com/jobs/40967c6c-9fd4-45f1-970c-7a219d69e691/images/";
const banners = [
  IMG + "f7111907ce61a8f107920d7cc805269c7a7a550e193080fb32fa7b0050c82c3a.jpeg",
  IMG + "3c4eaf120f75bef93c37314b6527cc095916a919a1ff49106c016efe4134d152.jpeg",
  IMG + "080fc8f94108a773078b69fc24469d4be3db4921372b8a844bde2a5a31754914.jpeg",
];

const run = async () => {
  await mongoose.connect(mongoUri);
  await Slider.deleteMany({});
  await Slider.insertMany(
    banners.map((url, i) => ({
      desktopImage: url,
      mobileImage: url,
      order: i + 1,
      status: "active",
    })),
  );
  console.log("Seeded sliders:", await Slider.countDocuments());
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
