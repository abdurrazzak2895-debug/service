import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminLogout, getAdminProfile } from "./authAPI";

export const rehydrateAuth = createAsyncThunk(
  "auth/rehydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { admin } = await getAdminProfile();
      if (!admin?.email) throw new Error("No active admin session");
      localStorage.setItem("admin", JSON.stringify(admin));
      return { admin };
    } catch (error) {
      localStorage.removeItem("admin");
      return rejectWithValue(error?.response?.data?.message || "Auth restore failed");
    }
  },
);

export const fetchAdminProfile = createAsyncThunk(
  "auth/fetchAdminProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { admin } = await getAdminProfile();
      return admin;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Profile load failed");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  dispatch(clearCredentials());
  try {
    await adminLogout();
  } catch {
    // The local session is cleared even if the network request fails.
  }
});

const initialState = {
  admin: null,
  token: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { admin } = action.payload;
      state.admin = admin;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.setItem("admin", JSON.stringify(admin));
    },
    clearCredentials: (state) => {
      state.admin = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("admin");
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
        state.token = null;
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
        state.token = null;
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
      });
  },
});

export const { setCredentials, clearCredentials, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
