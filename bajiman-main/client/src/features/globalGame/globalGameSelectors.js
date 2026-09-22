export const selectGlobalGame = (state) => state.globalGame;

export const selectGameCategories = (state) => state.globalGame.categories;
export const selectGameProviders = (state) => state.globalGame.providers;
export const selectHomeProviders = (state) => state.globalGame.homeProviders;
export const selectGlobalGames = (state) => state.globalGame.games;
export const selectHotGames = (state) => state.globalGame.hotGames;
export const selectPopularGames = (state) => state.globalGame.popularGames;
export const selectSports = (state) => state.globalGame.sports;

export const selectGamesByCategory = (state) =>
  state.globalGame.gamesByCategory;
export const selectGamesByProvider = (state) =>
  state.globalGame.gamesByProvider;
export const selectProvidersByCategory = (state) =>
  state.globalGame.providersByCategory;

export const selectGlobalGameLoading = (state) => state.globalGame.loading;
export const selectGlobalGameLoaded = (state) => state.globalGame.loaded;
export const selectGlobalGameError = (state) => state.globalGame.error;

export const selectScopedCatalog = (state) => state.globalGame.scopedCatalog;
export const selectScopedCatalogKey = (state) =>
  state.globalGame.scopedCatalogKey;
export const selectScopedCatalogLoading = (state) =>
  state.globalGame.scopedCatalogLoading;
export const selectScopedCatalogError = (state) =>
  state.globalGame.scopedCatalogError;

export const selectSearchCatalog = (state) => state.globalGame.searchCatalog;
export const selectSearchCatalogLoading = (state) =>
  state.globalGame.searchCatalogLoading;
export const selectSearchCatalogLoaded = (state) =>
  state.globalGame.searchCatalogLoaded;

export const selectPlayGame = (state) => state.globalGame.playGame;
export const selectPlayGameLoading = (state) =>
  state.globalGame.playGameLoading;
export const selectPlayGameError = (state) => state.globalGame.playGameError;
