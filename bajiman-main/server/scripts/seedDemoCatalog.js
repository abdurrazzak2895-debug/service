import mongoose from "mongoose";
import dotenv from "dotenv";

import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";
import HotGame from "../models/HotGame.js";
import PopularGame from "../models/PopularGame.js";
import Sport from "../models/Sport.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const categories = [
  {
    key: "casino",
    categoryName: { bn: "ক্যাসিনো", en: "Casino" },
    categoryTitle: { bn: "ক্যাসিনো গেমস", en: "Casino Games" },
    iconImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
    order: 1,
    status: "active",
  },
  {
    key: "slots",
    categoryName: { bn: "স্লটস", en: "Slots" },
    categoryTitle: { bn: "স্লটস মেশিন", en: "Slot Machines" },
    iconImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80",
    order: 2,
    status: "active",
  },
  {
    key: "fishing",
    categoryName: { bn: "ফিশিং", en: "Fishing" },
    categoryTitle: { bn: "ফিশিং গেমস", en: "Fishing Games" },
    iconImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80",
    order: 3,
    status: "active",
  },
  {
    key: "sports",
    categoryName: { bn: "স্পোর্টস", en: "Sports" },
    categoryTitle: { bn: "স্পোর্টস বেট", en: "Sports Betting" },
    iconImage: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=400&q=80",
    order: 4,
    status: "active",
  },
];

const providerCatalog = [
  { categoryKey: "casino", code: "JOKER", name: "Joker", icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80" },
  { categoryKey: "casino", code: "PRAGMATIC", name: "Pragmatic Play", icon: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80" },
  { categoryKey: "slots", code: "PGSOFT", name: "PG Soft", icon: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=200&q=80" },
  { categoryKey: "fishing", code: "FISH", name: "Fishing Master", icon: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=200&q=80" },
  { categoryKey: "sports", code: "SPORTS", name: "Sportsbook", icon: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=200&q=80" },
];

const games = [
  { categoryKey: "casino", providerCode: "JOKER", gameUId: "joker-lucky-gold", name: "Lucky Gold", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "casino", providerCode: "JOKER", gameUId: "joker-royal-win", name: "Royal Win", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "casino", providerCode: "PRAGMATIC", gameUId: "pragmatic-aztec", name: "Aztec Treasure", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "casino", providerCode: "PRAGMATIC", gameUId: "pragmatic-sweet-bonanza", name: "Sweet Bonanza", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "slots", providerCode: "PGSOFT", gameUId: "pgsoft-cash-pool", name: "Cash Pool", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "slots", providerCode: "PGSOFT", gameUId: "pgsoft-galaxy-queen", name: "Galaxy Queen", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "slots", providerCode: "PGSOFT", gameUId: "pgsoft-lucky-dragons", name: "Lucky Dragons", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "fishing", providerCode: "FISH", gameUId: "fish-lagoon-burst", name: "Lagoon Burst", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "fishing", providerCode: "FISH", gameUId: "fish-deep-ocean", name: "Deep Ocean", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "sports", providerCode: "SPORTS", gameUId: "sports-football-fiesta", name: "Football Fiesta", image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "sports", providerCode: "SPORTS", gameUId: "sports-cricket-master", name: "Cricket Master", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80" },
  { categoryKey: "sports", providerCode: "SPORTS", gameUId: "sports-basket-glory", name: "Basket Glory", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80" },
];

const sports = [
  { name: { bn: "ফুটবল", en: "Football" }, iconImage: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=400&q=80", gameId: "sports-football-fiesta", isActive: true, order: 1 },
  { name: { bn: "ক্রিকেট", en: "Cricket" }, iconImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80", gameId: "sports-cricket-master", isActive: true, order: 2 },
  { name: { bn: "বাস্কেটবল", en: "Basketball" }, iconImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80", gameId: "sports-basket-glory", isActive: true, order: 3 },
];

const upsertCategory = async (item) => {
  const doc = await GameCategory.findOneAndUpdate(
    { "categoryName.en": item.categoryName.en },
    { $set: { ...item } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return doc;
};

const upsertProvider = async (categoryId, item) => {
  const doc = await GameProvider.findOneAndUpdate(
    { categoryId, providerCode: item.code.toUpperCase() },
    {
      $set: {
        categoryId,
        providerCode: item.code.toUpperCase(),
        providerName: item.name,
        providerIcon: item.icon,
        isHome: true,
        status: "active",
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return doc;
};

const upsertGame = async (categoryId, providerDbId, item) => {
  const doc = await Game.findOneAndUpdate(
    { providerDbId, gameUId: item.gameUId },
    {
      $set: {
        categoryId,
        providerDbId,
        gameUId: item.gameUId,
        image: item.image,
        status: "active",
        syncStatus: "synced",
        lastSyncedAt: new Date(),
        isHot: true,
        isFavorites: true,
        isLatest: true,
        isAZ: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return doc;
};

const ensureHotGame = async (gameUId) => {
  await HotGame.findOneAndUpdate(
    { gameId: gameUId },
    {
      $set: { gameId: gameUId, image: "", status: "active", order: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const ensurePopularGame = async (gameUId) => {
  await PopularGame.findOneAndUpdate(
    { gameId: gameUId },
    {
      $set: { gameId: gameUId, image: "", status: "active", order: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const ensureSport = async (item) => {
  await Sport.findOneAndUpdate(
    { gameId: item.gameId },
    {
      $set: { ...item, syncStatus: "synced", lastSyncedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const seed = async () => {
  await mongoose.connect(mongoUri);

  const categoryMap = {};
  for (const item of categories) {
    const categoryDoc = await upsertCategory(item);
    categoryMap[item.key] = categoryDoc._id;
  }

  const providerMap = {};
  for (const item of providerCatalog) {
    const categoryId = categoryMap[item.categoryKey];
    const providerDoc = await upsertProvider(categoryId, item);
    providerMap[`${item.categoryKey}:${item.code}`] = providerDoc._id;
  }

  for (const item of games) {
    const categoryId = categoryMap[item.categoryKey];
    const providerDbId = providerMap[`${item.categoryKey}:${item.providerCode}`];

    if (!categoryId || !providerDbId) continue;

    const gameDoc = await upsertGame(categoryId, providerDbId, item);

    if (gameDoc?._id) {
      await ensureHotGame(gameDoc.gameUId);
      await ensurePopularGame(gameDoc.gameUId);
    }
  }

  for (const item of sports) {
    await ensureSport(item);
  }

  const counts = {
    categories: await GameCategory.countDocuments(),
    providers: await GameProvider.countDocuments(),
    games: await Game.countDocuments(),
    hotGames: await HotGame.countDocuments(),
    popularGames: await PopularGame.countDocuments(),
    sports: await Sport.countDocuments(),
  };

  console.log("Seeded demo catalog:", counts);
};

seed()
  .then(() => mongoose.disconnect())
  .catch((error) => {
    console.error("Seed failed:", error);
    mongoose.disconnect();
    process.exit(1);
  });
