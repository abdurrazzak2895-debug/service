#!/usr/bin/env node
import "dotenv/config";
import mongoose from "mongoose";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";

const baseUrl = String(process.env.WORLD_CASINO_API_BASE || "https://world-casino-api.com/api/v1").replace(/\/+$/, "");
const token = String(process.env.WORLD_CASINO_TOKEN || "").trim();
const categoryId = String(process.env.WORLD_CASINO_CATEGORY_ID || "").trim();
const requestMethod = String(process.env.WORLD_CASINO_METHOD || "GET").toUpperCase();
const tokenMode = String(process.env.WORLD_CASINO_TOKEN_MODE || "query").toLowerCase();
const tokenHeader = String(process.env.WORLD_CASINO_TOKEN_HEADER || "token").trim();
const tokenQuery = String(process.env.WORLD_CASINO_TOKEN_QUERY || "token").trim();
const providerPath = String(process.env.WORLD_CASINO_PROVIDERS_PATH || "/providers");
const gamesPath = String(process.env.WORLD_CASINO_GAMES_PATH || "/games");
const brandFilter = String(process.env.WORLD_CASINO_BRAND_ID || "").trim();
const dryRun = ["1", "true", "yes"].includes(String(process.env.WORLD_CASINO_DRY_RUN || "true").toLowerCase());
const concurrency = Math.max(1, Number(process.env.WORLD_CASINO_CONCURRENCY || 3));

if (!token || !categoryId) {
  console.error("Required environment variables: WORLD_CASINO_TOKEN and WORLD_CASINO_CATEGORY_ID");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("Required environment variable: MONGO_URI");
  process.exit(1);
}

const unwrap = (payload) => payload?.data ?? payload?.result ?? payload;
const listFrom = (payload, keys = []) => {
  const candidates = [payload, unwrap(payload), ...keys.flatMap((key) => [payload?.[key], unwrap(payload)?.[key]])];
  return candidates.find(Array.isArray) || [];
};
const cleanCode = (value) => String(value || "").trim().toUpperCase();
const safeError = (error) => String(error?.message || error).replace(token, "[REDACTED]");

const request = async (path, extra = {}) => {
  const url = new URL(`${baseUrl}/${String(path).replace(/^\/+/, "")}`);
  const body = { ...extra };
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (tokenMode === "header") headers[tokenHeader] = token;
  if (tokenMode === "bearer") headers.Authorization = `Bearer ${token}`;
  if (tokenMode === "query") url.searchParams.set(tokenQuery, token);
  if (tokenMode === "body") body.token = token;

  const response = await fetch(url, {
    method: requestMethod,
    headers,
    ...(requestMethod === "GET" ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  if (!response.ok || (payload?.code !== undefined && Number(payload.code) >= 400)) {
    throw new Error(`${requestMethod} ${path} failed (${response.status}): ${payload?.msg || payload?.message || text}`);
  }
  return payload;
};

const fetchProviders = async () => {
  const payload = await request(providerPath);
  return listFrom(payload, ["providers", "providerList", "items"])
    .map((item) => ({
      brandId: String(item.brand_id || item.brandId || item.provider_id || item.id || "").trim(),
      providerCode: cleanCode(`WORLD_${item.brand_id || item.brandId || item.provider_id || item.id || item.name}`),
      providerName: String(item.providerName || item.provider_name || item.name || item.title || "").trim(),
      image: item.image || item.logo || item.icon || "",
    }))
    .filter((item) => item.brandId && item.providerCode && item.providerName)
    .filter((item) => !brandFilter || item.brandId === brandFilter);
};

const fetchGames = async () => {
  const payload = await request(gamesPath);
  return listFrom(payload, ["games", "gameList", "items"])
    .map((item) => ({
      brandId: String(item.brand_id || item.brandId || "").trim(),
      gameUId: String(item.gameUId || item.game_uid || item.gameId || item.game_id || item.id || "").trim(),
      image: item.thumbnail || item.image || item.logo || item.icon || "",
      name: item.name || item.gameName || item.game_name || "",
    }))
    .filter((item) => item.brandId && item.gameUId)
    .filter((item) => !brandFilter || item.brandId === brandFilter);
};

const eachLimit = async (items, worker) => {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) await worker(items[cursor++]);
  }));
};

const main = async () => {
  const category = await GameCategory.findById(categoryId).lean();
  if (!category) throw new Error(`Category not found: ${categoryId}`);
  const providers = await fetchProviders();
  if (!providers.length) throw new Error("The API returned no providers; verify token mode and response mapping");
  const allGames = await fetchGames();
  const gamesByBrand = new Map();
  for (const game of allGames) {
    if (!gamesByBrand.has(game.brandId)) gamesByBrand.set(game.brandId, []);
    gamesByBrand.get(game.brandId).push(game);
  }

  const summary = {
    dryRun,
    providersFound: providers.length,
    gamesFetched: 0,
    providersUpserted: 0,
    gamesUpserted: 0,
    errors: [],
  };

  await eachLimit(providers, async (providerInfo) => {
    try {
      let provider;
      if (!dryRun) {
        provider = await GameProvider.findOneAndUpdate(
          { categoryId: category._id, providerCode: providerInfo.providerCode },
          {
            $set: {
              providerName: providerInfo.providerName,
              providerIcon: providerInfo.image,
              status: "active",
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            },
            $setOnInsert: { categoryId: category._id, providerCode: providerInfo.providerCode, isHome: false },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        summary.providersUpserted += 1;
      }

      const games = gamesByBrand.get(providerInfo.brandId) || [];
      summary.gamesFetched += games.length;
      if (dryRun) return;

      const operations = games.map((game) => ({
        updateOne: {
          filter: { providerDbId: provider._id, gameUId: game.gameUId },
          update: {
            $set: {
              categoryId: category._id,
              providerDbId: provider._id,
              image: game.image,
              status: "active",
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            },
            $setOnInsert: {
              gameUId: game.gameUId,
              gameName: game.name,
              oracleImageType: "thumbnail",
              isHot: false,
              isFavorites: false,
              isLatest: true,
              isAZ: false,
            },
            },
          upsert: true,
        },
      }));
      if (operations.length) {
        const result = await Game.bulkWrite(operations, { ordered: false });
        summary.gamesUpserted += (result.upsertedCount || 0) + (result.modifiedCount || 0);
      }
    } catch (error) {
      summary.errors.push({ providerCode: providerInfo.providerCode, message: safeError(error) });
    }
  });

  console.log(JSON.stringify(summary, null, 2));
  if (summary.errors.length) process.exitCode = 2;
};

mongoose.connect(process.env.MONGO_URI)
  .then(main)
  .catch((error) => {
    console.error(safeError(error));
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
