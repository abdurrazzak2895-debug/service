export const selectAuth = (state) => state.auth;

export const selectAffiliateUser = (state) => state.auth.user;

export const selectAffiliateToken = (state) => state.auth.token;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectAffiliateRole = (state) => state.auth.user?.role || "";

export const selectIsAffiliateUser = (state) =>
  state.auth.user?.role === "aff-user";

export const selectAffiliateBalance = (state) =>
  Number(state.auth.user?.balance || 0);

export const selectAffiliateCommissionBalance = (state) =>
  Number(state.auth.user?.commissionBalance || 0);

export const selectAffiliateReferralCode = (state) =>
  state.auth.user?.referralCode || "";
