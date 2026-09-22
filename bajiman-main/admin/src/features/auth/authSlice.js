import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminProfile } from "./authAPI";

export const rehydrateAuth = createAsyncThunk(
  "auth/rehydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      const storedToken = localStorage.getItem("token");

      if (!storedAdmin || !storedToken) {
        return {
          admin: null,
          token: null,
        };
      }

      return {
        admin: JSON.parse(storedAdmin),
        token: storedToken,
      };
    } catch (error) {
      localStorage.removeItem("admin");
      localStorage.removeItem("token");

      return rejectWithValue("Auth restore failed");
    }
  },
);

export const fetchAdminProfile = createAsyncThunk(
  "auth/fetchAdminProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminProfile();

      return data.admin;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Profile load failed",
      );
    }
  },
);

const initialState = {
  admin: null,
  token: localStorage.getItem("token") || null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { admin, token } = action.payload;

      state.admin = admin;
      state.token = token;
      state.loading = false;
      state.error = null;

      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("token", token);
    },

    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("admin");
      localStorage.removeItem("token");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(rehydrateAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(rehydrateAuth.fulfilled, (state, action) => {
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(rehydrateAuth.rejected, (state, action) => {
        state.admin = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload || "Auth restore failed";
      })

      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.loading = false;
        state.error = null;

        localStorage.setItem("admin", JSON.stringify(action.payload));
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.admin = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload || "Unauthorized";

        localStorage.removeItem("admin");
        localStorage.removeItem("token");
      });
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
