export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectIsAuth = (state) => state.auth.isAuth;

export const selectUserRole = (state) => state.auth.user?.role || "";

export const selectUserBalance = (state) => Number(state.auth.user?.balance || 0);