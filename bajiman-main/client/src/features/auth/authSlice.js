import { createSlice } from "@reduxjs/toolkit";

const getSavedUser = () => {
  try {
    const user = localStorage.getItem("user_data");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getSavedToken = () => localStorage.getItem("user_token") || null;

const initialState = {
  user: getSavedUser(),
  token: getSavedToken(),
  isAuth: Boolean(getSavedToken()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      const user = getSavedUser();
      const token = getSavedToken();

      state.user = user;
      state.token = token;
      state.isAuth = Boolean(user && token);
    },

    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};

      state.user = user || null;
      state.token = token || null;
      state.isAuth = Boolean(user && token);

      if (user && token) {
        localStorage.setItem("user_data", JSON.stringify(user));
        localStorage.setItem("user_token", token);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;

      localStorage.removeItem("user_data");
      localStorage.removeItem("user_token");
    },

    updateUser: (state, action) => {
      state.user = {
        ...(state.user || {}),
        ...(action.payload || {}),
      };

      localStorage.setItem("user_data", JSON.stringify(state.user));
    },
  },
});

export const { rehydrateAuth, setCredentials, logout, updateUser } =
  authSlice.actions;

export default authSlice.reducer;
