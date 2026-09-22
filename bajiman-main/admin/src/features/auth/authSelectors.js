export const selectAuth = (state) => state.auth;

export const selectAdmin = (state) => state.auth.admin;

// Kept for compatibility with existing consumers; the real token is HttpOnly.
export const selectToken = () => null;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => !!state.auth.admin?.email;

export const selectAdminRole = (state) => state.auth.admin?.role;

export const selectAdminPermissions = (state) =>
  state.auth.admin?.permissions || [];
