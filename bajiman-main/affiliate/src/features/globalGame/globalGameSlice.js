import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export const fetchGlobalGameData = createAsyncThunk(
  "globalGame/fetchGlobalGameData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/global/client/game-data");
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load game data"
      );
    }
  }
);

export const fetchGameList = createAsyncThunk(
  "globalGame/fetchGameList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/global/client/game-list", { params });
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load games"
      );
    }
  }
);

export const fetchPlayGameDetails = createAsyncThunk(
  "globalGame/fetchPlayGameDetails",
  async (gameId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/global/client/play-game/${gameId}`);
      return res?.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load play game"
      );
    }
  }
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

  gameList: [],
  gameListMeta: {
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 1,
  },

  playGame: null,

  loading: false,
  loaded: false,
  error: null,

  gameListLoading: false,
  gameListError: null,

  playGameLoading: false,
  playGameError: null,
};

const globalGameSlice = createSlice({
  name: "globalGame",
  initialState,
  reducers: {
    clearGlobalGameError: (state) => {
      state.error = null;
      state.gameListError = null;
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

        state.categories = Array.isArray(data.categories) ? data.categories : [];
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

      .addCase(fetchGameList.pending, (state) => {
        state.gameListLoading = true;
        state.gameListError = null;
      })
      .addCase(fetchGameList.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.gameListLoading = false;
        state.gameList = Array.isArray(data.games) ? data.games : [];
        state.gameListMeta = data.meta || {
          page: 1,
          limit: 24,
          total: 0,
          totalPages: 1,
        };
      })
      .addCase(fetchGameList.rejected, (state, action) => {
        state.gameListLoading = false;
        state.gameListError = action.payload || "Failed to load games";
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