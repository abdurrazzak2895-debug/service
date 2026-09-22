import axios from "axios";
import GameApiKeySetting from "../models/GameApiKeySetting.js";

// Resolves a real played game's gameUId -> providerCode for turnover
// provider gating (see callbackRoutes.js). The locally-synced Game/
// GameProvider collections only mirror whatever an admin has manually
// curated (hot/featured games) — nowhere near the full live catalog
// (5000+ games) — so a played game's gameUId almost never exists there.
// The live master API's client/game-list DOES cover the full catalog and
// embeds each game's provider.providerCode directly, confirmed against
// real GameHistory.game_uid values. That endpoint is paginated (a few
// thousand games), so the map is cached and refreshed periodically
// instead of hit on every webhook call.
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_LIMIT = 2000;

let cache = { map: new Map(), fetchedAt: 0 };
let inflight = null;

const cleanBaseUrl = (url = "") => String(url || "").trim().replace(/\/+$/, "");

// A game can carry its provider info two ways depending on which master
// endpoint it came from: a flat `provider.providerCode` (client/game-list,
// client/game-data's `games`), or nested one level under `.game` (hot/
// popular game entries from client/game-data, which wrap the underlying
// game record). Checks both so hot/popular games resolve too.
const addGamesToMap = (map, games) => {
  (Array.isArray(games) ? games : []).forEach((item) => {
    const uid = String(item?.gameUId || item?.game?.gameUId || "").trim();
    const code = String(
      item?.provider?.providerCode || item?.game?.provider?.providerCode || "",
    )
      .trim()
      .toUpperCase();

    if (uid && code) map.set(uid, code);
  });
};

const fetchFullCatalogMap = async () => {
  const setting = await GameApiKeySetting.findOne()
    .sort({ createdAt: -1 })
    .lean();

  if (!setting?.apiKey || !setting.isActive || !setting.isVerified) {
    throw new Error("Game API key not active/verified");
  }

  const baseUrl = cleanBaseUrl(process.env.MASTER_API_URL);
  if (!baseUrl) throw new Error("MASTER_API_URL is missing in .env");

  const headers = {
    "x-api-key": setting.apiKey,
    "Content-Type": "application/json",
  };

  const map = new Map();
  let page = 1;
  let totalPages = 1;

  do {
    const response = await axios.get(
      `${baseUrl}/api/master/cx-global/client/game-list`,
      { timeout: 30000, headers, params: { page, limit: FETCH_LIMIT } },
    );

    const data = response?.data?.data || {};
    addGamesToMap(map, data.games);

    totalPages = Number(data?.meta?.totalPages || 1) || 1;
    page += 1;
  } while (page <= totalPages);

  // client/game-list is the primary (full-catalog) source above, but hot/
  // popular games shown on the homepage come from a separate endpoint —
  // merge those in too as a safety net against any sync lag between the
  // two master endpoints, since that's exactly where users actually click
  // to play from.
  try {
    const gameDataResponse = await axios.get(
      `${baseUrl}/api/master/cx-global/client/game-data`,
      { timeout: 30000, headers },
    );

    const gameData = gameDataResponse?.data?.data || {};
    addGamesToMap(map, gameData.games);
    addGamesToMap(map, gameData.hotGames);
    addGamesToMap(map, gameData.popularGames);
  } catch {
    // Non-fatal — the game-list pass above already covers the full
    // catalog in the common case.
  }

  return map;
};

// Stale-while-revalidate: a payment webhook can't afford to block on a
// multi-request catalog fetch, so once a cache exists it's always
// returned immediately (even if past TTL) while a fresh fetch runs in
// the background for next time. Only a true cold start (no cache yet)
// waits on the network.
export const getGameProviderCodeMap = async () => {
  const now = Date.now();
  const hasCache = cache.map.size > 0;
  const isStale = now - cache.fetchedAt >= CACHE_TTL_MS;

  if (hasCache && !isStale) {
    return cache.map;
  }

  if (!inflight) {
    inflight = fetchFullCatalogMap()
      .then((map) => {
        cache = { map, fetchedAt: Date.now() };
        return map;
      })
      .catch(() => cache.map)
      .finally(() => {
        inflight = null;
      });
  }

  if (hasCache) return cache.map;
  return inflight;
};

export const resolveProviderCodeFromCatalog = async (gameUId) => {
  const map = await getGameProviderCodeMap();
  return map.get(String(gameUId || "").trim()) || null;
};
