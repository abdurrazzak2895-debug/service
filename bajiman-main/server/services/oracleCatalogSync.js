import axios from "axios";
import mongoose from "mongoose";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";
import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";

const providerListUrl = () =>
  (process.env.ORACLE_PROVIDER_LIST_API || "https://oraclegames.net/api/providerlist").replace(/\/+$/, "");
const gameBaseUrl = () =>
  (process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game").replace(/\/+$/, "");
const providerKey = () =>
  String(process.env.ORACLE_PROVIDER_LIST_KEY || process.env.ORACLE_GAME_DATA_KEY || "").trim();
const gameKey = () =>
  String(process.env.ORACLE_GAME_DATA_KEY || process.env.ORACLE_PROVIDER_LIST_KEY || "").trim();
const headers = (key) => ({ "x-oraclegamedata-key": key });
const cleanCode = (value) => String(value || "").trim().toUpperCase();
const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.providers)) return payload.providers;
  if (Array.isArray(payload?.data?.providers)) return payload.data.providers;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data?.games)) return payload.data.games;
  return [];
};

export const checkDepositSetup = async () => {
  const methods = await DepositMethod.find({ isActive: true }).lean();
  const methodIds = methods.map((item) => item._id);
  const configs = methodIds.length
    ? await DepositFieldConfig.find({ depositMethod: { $in: methodIds } }).lean()
    : [];
  const configuredIds = new Set(configs.map((item) => String(item.depositMethod)));
  const missingFieldConfig = methods
    .filter((item) => !configuredIds.has(String(item._id)))
    .map((item) => item.methodId);
  return {
    ok: methods.length > 0 && missingFieldConfig.length === 0,
    activeMethods: methods.length,
    fieldConfigs: configs.length,
    missingFieldConfig,
    warning:
      methods.length === 0
        ? "No active deposit methods configured."
        : missingFieldConfig.length
          ? "Some active deposit methods have no field configuration."
          : "Deposit channel setup looks complete.",
  };
};

const fetchProviders = async () => {
  if (!providerKey()) throw new Error("ORACLE_PROVIDER_LIST_KEY or ORACLE_GAME_DATA_KEY is missing");
  const response = await axios.get(providerListUrl(), { headers: headers(providerKey()), timeout: 30000 });
  return asList(response.data)
    .filter((item) => item?.code && item?.name)
    .map((item) => ({
      providerCode: cleanCode(item.code),
      providerName: String(item.name).trim(),
      image: item.image || "",
    }));
};

const fetchGames = async (providerCode) => {
  if (!gameKey()) throw new Error("ORACLE_GAME_DATA_KEY or ORACLE_PROVIDER_LIST_KEY is missing");
  const response = await axios.get(`${gameBaseUrl()}/${encodeURIComponent(providerCode)}`, {
    headers: headers(gameKey()),
    timeout: 30000,
  });
  return asList(response.data)
    .filter((item) => item?.game_uid)
    .map((item) => ({
      gameUId: String(item.game_uid).trim(),
      image: item.thumbnail || item.original || item.height || "",
    }));
};

const resolveCategory = async (categoryId) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("A valid categoryId is required; Oracle providers do not include local category IDs");
  }
  const category = await GameCategory.findById(categoryId);
  if (!category) throw new Error(`Category not found: ${categoryId}`);
  return category;
};

const runWithLimit = async (items, limit, worker) => {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
};

export const syncOracleCatalog = async ({ categoryId, providerCodes = [], dryRun = false, concurrency = 3 } = {}) => {
  const deposit = await checkDepositSetup();
  const category = await resolveCategory(categoryId);
  const allProviders = await fetchProviders();
  const allowed = new Set(providerCodes.map(cleanCode).filter(Boolean));
  const providers = allowed.size
    ? allProviders.filter((item) => allowed.has(item.providerCode))
    : allProviders;
  if (!providers.length) throw new Error("No Oracle providers matched the requested providerCodes");

  const summary = {
    dryRun: Boolean(dryRun),
    categoryId: String(category._id),
    providersFound: providers.length,
    providersCreated: 0,
    providersUpdated: 0,
    gamesFetched: 0,
    gamesCreated: 0,
    gamesUpdated: 0,
    providerErrors: [],
    deposit,
  };

  await runWithLimit(providers, Math.max(1, Number(concurrency) || 3), async (providerInfo) => {
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
        if (provider.createdAt?.getTime() === provider.updatedAt?.getTime()) summary.providersCreated += 1;
        else summary.providersUpdated += 1;
      }
      const games = await fetchGames(providerInfo.providerCode);
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
        summary.gamesCreated += result.upsertedCount || 0;
        summary.gamesUpdated += result.modifiedCount || 0;
      }
    } catch (error) {
      summary.providerErrors.push({ providerCode: providerInfo.providerCode, message: error.message });
    }
  });
  return summary;
};

export { fetchProviders, fetchGames };
export default syncOracleCatalog;
