import { createSlice } from "@reduxjs/toolkit";

const getSavedUser = () => {
  try {
    const user = localStorage.getItem("affiliate_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getSavedToken = () => localStorage.getItem("affiliate_token") || null;

const initialState = {
  user: getSavedUser(),
  token: getSavedToken(),
  loading: false,
  isAuthenticated: Boolean(getSavedUser() && getSavedToken()),
};

const authSlice = createSlice({
  name: "affiliateAuth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      const user = getSavedUser();
      const token = getSavedToken();

      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(user && token);
    },

    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};

      state.user = user || null;
      state.token = token || null;
      state.isAuthenticated = Boolean(user && token);

      if (user && token) {
        localStorage.setItem("affiliate_user", JSON.stringify(user));
        localStorage.setItem("affiliate_token", token);
      }
    },

    updateAffiliateUser: (state, action) => {
      state.user = {
        ...(state.user || {}),
        ...(action.payload || {}),
      };

      localStorage.setItem("affiliate_user", JSON.stringify(state.user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.isAuthenticated = false;

      localStorage.removeItem("affiliate_user");
      localStorage.removeItem("affiliate_token");
    },

    setAuthLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
  },
});

export const {
  rehydrateAuth,
  setCredentials,
  updateAffiliateUser,
  logout,
  setAuthLoading,
} = authSlice.actions;

export default authSlice.reducer;
