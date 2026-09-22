export const selectAuth = (state) => state.auth;

export const selectAdmin = (state) => state.auth.admin;

export const selectToken = (state) => state.auth.token;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => {
  const { admin, token } = state.auth;

  return !!token && !!admin?.email;
};

export const selectAdminRole = (state) => state.auth.admin?.role;

export const selectAdminPermissions = (state) =>
  state.auth.admin?.permissions || [];
