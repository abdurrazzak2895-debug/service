import axios from "axios";
import mongoose from "mongoose";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";

const baseUrl = () =>
  String(process.env.WORLD_CASINO_API_BASE || "https://world-casino-api.com/api/v1").replace(/\/+$/, "");
const token = () => String(process.env.WORLD_CASINO_TOKEN || "").trim();
const pageSize = () => Math.min(100, Math.max(1, Number(process.env.WORLD_CASINO_PAGE_SIZE || 100)));

const cleanCode = (value) => String(value || "").trim().toUpperCase();
const listFrom = (payload, keys = []) => {
  const candidates = [payload, payload?.data, ...keys.flatMap((key) => [payload?.[key], payload?.data?.[key]])];
  return candidates.find(Array.isArray) || [];
};
const safeError = (error) => String(error?.response?.data?.msg || error?.response?.data?.message || error?.message || error);

const assertConfig = () => {
  if (!token()) throw new Error("WORLD_CASINO_TOKEN is not configured on the server");
};

const request = async (path, params = {}) => {
  assertConfig();
  const response = await axios.get(`${baseUrl()}${path}`, {
    params: { token: token(), ...params },
    timeout: 30000,
  });
  const payload = response.data;
  if (!response.status.toString().startsWith("2") || Number(payload?.code) >= 400) {
    throw new Error(`${path} failed: ${safeError({ response })}`);
  }
  return payload;
};

export const fetchWorldCasinoProviders = async () => {
  const payload = await request("/providers", { currency_supported: 1 });
  return listFrom(payload, ["providers"])
    .map((item) => ({
      brandId: String(item.brand_id || item.brandId || item.id || "").trim(),
      providerCode: cleanCode(`WORLD_${item.brand_id || item.brandId || item.id || item.name}`),
      providerName: String(item.name || item.provider_name || item.providerName || "").trim(),
      image: item.logo || item.image || item.icon || "",
    }))
    .filter((item) => item.brandId && item.providerCode && item.providerName);
};

export const fetchWorldCasinoGames = async (brandId) => {
  const games = [];
  let offset = 0;
  const limit = pageSize();

  while (true) {
    const payload = await request("/games", {
      brand_id: brandId,
      currency_supported: 1,
      limit,
      offset,
    });
    const page = listFrom(payload, ["games"]);
    games.push(
      ...page
        .map((item) => ({
          brandId: String(item.brand_id || item.brandId || brandId).trim(),
          gameUId: String(item.game_uid || item.gameUId || item.game_id || item.gameId || item.id || "").trim(),
          name: String(item.name || item.game_name || item.gameName || "").trim(),
          image: item.logo || item.thumbnail || item.image || item.icon || "",
        }))
        .filter((item) => item.gameUId),
    );

    const hasMore = payload?.data?.has_more ?? payload?.has_more;
    if (hasMore !== true || page.length < limit) break;
    offset += limit;
  }

  return games;
};

const resolveCategory = async (categoryId) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("A valid categoryId is required");
  }
  const category = await GameCategory.findById(categoryId);
  if (!category) throw new Error(`Game category not found: ${categoryId}`);
  return category;
};

export const syncWorldCasinoCatalog = async ({ categoryId, brandId = "141", dryRun = false } = {}) => {
  const category = await resolveCategory(categoryId);
  const allProviders = await fetchWorldCasinoProviders();
  const providers = String(brandId || "").trim()
    ? allProviders.filter((item) => item.brandId === String(brandId).trim())
    : allProviders;
  if (!providers.length) throw new Error(`No World Casino provider matched brandId ${brandId || "(all)"}`);

  const summary = {
    dryRun: Boolean(dryRun),
    categoryId: String(category._id),
    brandId: brandId ? String(brandId) : null,
    providersFound: providers.length,
    providersCreated: 0,
    providersUpdated: 0,
    gamesFetched: 0,
    gamesCreated: 0,
    gamesUpdated: 0,
    providerErrors: [],
  };

  for (const providerInfo of providers) {
    try {
      const games = await fetchWorldCasinoGames(providerInfo.brandId);
      summary.gamesFetched += games.length;
      if (dryRun) continue;

      const before = await GameProvider.exists({ categoryId: category._id, providerCode: providerInfo.providerCode });
      const provider = await GameProvider.findOneAndUpdate(
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
      if (before) summary.providersUpdated += 1;
      else summary.providersCreated += 1;

      if (!games.length) continue;
      const result = await Game.bulkWrite(
        games.map((game) => ({
          updateOne: {
            filter: { providerDbId: provider._id, gameUId: game.gameUId },
            update: {
              $set: {
                categoryId: category._id,
                providerDbId: provider._id,
                name: game.name,
                image: game.image,
                status: "active",
                syncStatus: "synced",
                lastSyncedAt: new Date(),
              },
              $setOnInsert: {
                gameUId: game.gameUId,
                oracleImageType: "thumbnail",
                isHot: false,
                isFavorites: false,
                isLatest: true,
                isAZ: false,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );
      summary.gamesCreated += result.upsertedCount || 0;
      summary.gamesUpdated += result.modifiedCount || 0;
    } catch (error) {
      summary.providerErrors.push({ providerCode: providerInfo.providerCode, message: safeError(error) });
    }
  }

  return summary;
};

export default syncWorldCasinoCatalog;
