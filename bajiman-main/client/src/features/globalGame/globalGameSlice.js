import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

const GAME_PROXY_API = "/api/admin/game-api-key/client";

const LOCAL_GAME_DATA_API = "/api/global/client/game-data";

const loadGameData = async (url) => {
  const res = await api.get(url);
  return res?.data?.data || res?.data || {};
};

export const fetchGlobalGameData = createAsyncThunk(
  "globalGame/fetchGlobalGameData",
  async (_, { rejectWithValue }) => {
    try {
      try {
        return await loadGameData(LOCAL_GAME_DATA_API);
      } catch (localError) {
        try {
          return await loadGameData(`${GAME_PROXY_API}/game-data`);
        } catch (proxyError) {
          const message =
            proxyError?.response?.data?.message ||
            localError?.response?.data?.message ||
            "Failed to load game data";
          throw new Error(message);
        }
      }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load game data",
      );
    }
  },
);

// Shared by both catalog thunks below: pages through every result for a
// given set of game-list query params (categoryId/providerDbId), using the
// exact page size (24) normal browsing already fetches successfully —
// larger limits or a categoryId-less "everything" call aren't known to be
// supported by the upstream master API. Runs pages in bounded-concurrency
// batches so it stays reasonably fast even for a category with thousands
// of games, and one bad page can't sink the whole fetch.
const PAGE_LIMIT = 24;
const FETCH_CONCURRENCY = 12;

const runInBatches = async (items, worker, batchSize) => {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }

  return results;
};

const fetchAllGamesFor = async (extraParams, pageCap) => {
  const fetchPage = (page) =>
    api
      .get(`${GAME_PROXY_API}/game-list`, {
        params: { ...extraParams, page, limit: PAGE_LIMIT },
      })
      .then((res) => res?.data?.data || {})
      .catch(() => ({ games: [], meta: { totalPages: 1 } }));

  const first = await fetchPage(1);
  let games = Array.isArray(first.games) ? first.games : [];

  const totalPages = Math.min(
    Number(first?.meta?.totalPages || 1) || 1,
    pageCap,
  );

  if (totalPages > 1) {
    const pages = [];
    for (let page = 2; page <= totalPages; page += 1) pages.push(page);

    const rest = await runInBatches(pages, fetchPage, FETCH_CONCURRENCY);

    rest.forEach((data) => {
      if (Array.isArray(data.games)) games = games.concat(data.games);
    });
  }

  return games;
};

// Games.jsx browse view needs every game in the selected category/provider
// (not just one server-paginated page) so that games without a name/image
// can be filtered out client-side without leaving behind empty "phantom"
// pages. This fetches the full scoped list; Games.jsx paginates it itself.
const SCOPED_MAX_PAGES = 400; // safety cap: ~9600 games per category/provider

export const fetchScopedCatalog = createAsyncThunk(
  "globalGame/fetchScopedCatalog",
  async ({ categoryId, providerDbId } = {}, { rejectWithValue }) => {
    try {
      return await fetchAllGamesFor(
        { categoryId, providerDbId },
        SCOPED_MAX_PAGES,
      );
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load games",
      );
    }
  },
);

// Search needs to match every game in every category, site-wide (the site
// has ~15k games total), so it fetches each category's full list, one
// category at a time (each still paginated internally with up to
// FETCH_CONCURRENCY requests in flight), bounded by an overall games
// ceiling. Categories are processed sequentially rather than concurrently
// with each other so the number of simultaneous requests stays bounded to
// FETCH_CONCURRENCY instead of multiplying per category.
const SEARCH_TOTAL_GAMES_CAP = 20000; // overall safety ceiling, above the ~15k catalog

export const fetchSearchCatalog = createAsyncThunk(
  "globalGame/fetchSearchCatalog",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const categories = Array.isArray(state?.globalGame?.categories)
      ? state.globalGame.categories
      : [];
    const categoryIds = categories.map((item) => item?._id).filter(Boolean);

    try {
      let allGames = [];
      let budget = Math.floor(SEARCH_TOTAL_GAMES_CAP / PAGE_LIMIT);

      for (const categoryId of categoryIds) {
        if (budget <= 0) break;

        const games = await fetchAllGamesFor({ categoryId }, budget);
        allGames = allGames.concat(games);
        budget -= Math.ceil(games.length / PAGE_LIMIT);
      }

      return allGames;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load games for search",
      );
    }
  },
);

export const fetchPlayGameDetails = createAsyncThunk(
  "globalGame/fetchPlayGameDetails",
  async (gameId, { rejectWithValue }) => {
    try {
      const res = await api.get(`${GAME_PROXY_API}/play-game/${gameId}`);
      return res?.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load play game",
      );
    }
  },
);

const initialState = {
  categories: [],
  providers: [],
  homeProviders: [],
  games: [],
  hotGames: [],
  popularGames: [],
  sports: [],

  gamesByCategory: {},
  gamesByProvider: {},
  providersByCategory: {},

  scopedCatalog: [],
  scopedCatalogKey: null,
  scopedCatalogLoading: false,
  scopedCatalogError: null,

  searchCatalog: [],
  searchCatalogLoading: false,
  searchCatalogLoaded: false,
  searchCatalogError: null,

  playGame: null,

  loading: false,
  loaded: false,
  error: null,

  playGameLoading: false,
  playGameError: null,
};

const globalGameSlice = createSlice({
  name: "globalGame",
  initialState,
  reducers: {
    clearGlobalGameError: (state) => {
      state.error = null;
      state.playGameError = null;
    },

    clearPlayGame: (state) => {
      state.playGame = null;
      state.playGameError = null;
      state.playGameLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalGameData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalGameData.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.loading = false;
        state.loaded = true;

        state.categories = Array.isArray(data.categories)
          ? data.categories
          : [];
        state.providers = Array.isArray(data.providers) ? data.providers : [];
        state.homeProviders = Array.isArray(data.homeProviders)
          ? data.homeProviders
          : [];
        state.games = Array.isArray(data.games) ? data.games : [];
        state.hotGames = Array.isArray(data.hotGames) ? data.hotGames : [];
        state.popularGames = Array.isArray(data.popularGames)
          ? data.popularGames
          : [];
        state.sports = Array.isArray(data.sports) ? data.sports : [];

        state.gamesByCategory = data.gamesByCategory || {};
        state.gamesByProvider = data.gamesByProvider || {};
        state.providersByCategory = data.providersByCategory || {};
      })
      .addCase(fetchGlobalGameData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Failed to load game data";
      })

      .addCase(fetchScopedCatalog.pending, (state) => {
        state.scopedCatalogLoading = true;
        state.scopedCatalogError = null;
      })
      .addCase(fetchScopedCatalog.fulfilled, (state, action) => {
        const { categoryId, providerDbId } = action.meta.arg || {};

        state.scopedCatalogLoading = false;
        state.scopedCatalog = Array.isArray(action.payload)
          ? action.payload
          : [];
        state.scopedCatalogKey = `${categoryId || ""}|${providerDbId || ""}`;
      })
      .addCase(fetchScopedCatalog.rejected, (state, action) => {
        state.scopedCatalogLoading = false;
        state.scopedCatalogError = action.payload || "Failed to load games";
      })

      .addCase(fetchSearchCatalog.pending, (state) => {
        state.searchCatalogLoading = true;
        state.searchCatalogError = null;
      })
      .addCase(fetchSearchCatalog.fulfilled, (state, action) => {
        state.searchCatalogLoading = false;
        state.searchCatalogLoaded = true;
        state.searchCatalog = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchSearchCatalog.rejected, (state, action) => {
        state.searchCatalogLoading = false;
        state.searchCatalogLoaded = true;
        state.searchCatalogError =
          action.payload || "Failed to load games for search";
      })

      .addCase(fetchPlayGameDetails.pending, (state) => {
        state.playGameLoading = true;
        state.playGameError = null;
      })
      .addCase(fetchPlayGameDetails.fulfilled, (state, action) => {
        state.playGameLoading = false;
        state.playGame = action.payload || null;
      })
      .addCase(fetchPlayGameDetails.rejected, (state, action) => {
        state.playGameLoading = false;
        state.playGameError = action.payload || "Failed to load play game";
      });
  },
});

export const { clearGlobalGameError, clearPlayGame } = globalGameSlice.actions;

export default globalGameSlice.reducer;
