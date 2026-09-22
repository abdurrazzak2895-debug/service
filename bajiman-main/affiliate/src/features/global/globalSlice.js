import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export const fetchAffiliateGlobalData = createAsyncThunk(
  "global/fetchAffiliateGlobalData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/affiliate-global/client/site-data");
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Affiliate global data load failed",
      );
    }
  },
);

const initialState = {
  affSiteIdentify: null,
  affiliateSocialLinks: [],

  affiliateRegisterSetting: null,
  affiliateLoginSetting: null,
  affiliateSliderSetting: null,
  affiliateAgentSetting: null,
  affiliateAboutSetting: null,
  affiliateSponsorshipSetting: null,
  affiliateCommissionSetting: null,
  affiliateAdvantageSetting: null,
  affiliateRegistrationGuideSetting: null,
  affiliateWatchSetting: null,
  affiliateReviewSetting: null,
  affiliateFooterSetting: null,
  affiliateNavbarSetting: null,

  loading: false,
  loaded: false,
  error: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    clearGlobalData: (state) => {
      state.affSiteIdentify = null;
      state.affiliateSocialLinks = [];

      state.affiliateRegisterSetting = null;
      state.affiliateLoginSetting = null;
      state.affiliateSliderSetting = null;
      state.affiliateAgentSetting = null;
      state.affiliateAboutSetting = null;
      state.affiliateSponsorshipSetting = null;
      state.affiliateCommissionSetting = null;
      state.affiliateAdvantageSetting = null;
      state.affiliateRegistrationGuideSetting = null;
      state.affiliateWatchSetting = null;
      state.affiliateReviewSetting = null;
      state.affiliateFooterSetting = null;
      state.affiliateNavbarSetting = null;

      state.loading = false;
      state.loaded = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAffiliateGlobalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliateGlobalData.fulfilled, (state, action) => {
        const payload = action.payload || {};

        state.affSiteIdentify = payload.affSiteIdentify || null;
        state.affiliateSocialLinks = Array.isArray(payload.affiliateSocialLinks)
          ? payload.affiliateSocialLinks
          : [];

        state.affiliateRegisterSetting =
          payload.affiliateRegisterSetting || null;
        state.affiliateLoginSetting = payload.affiliateLoginSetting || null;
        state.affiliateSliderSetting = payload.affiliateSliderSetting || null;
        state.affiliateAgentSetting = payload.affiliateAgentSetting || null;
        state.affiliateAboutSetting = payload.affiliateAboutSetting || null;
        state.affiliateSponsorshipSetting =
          payload.affiliateSponsorshipSetting || null;
        state.affiliateCommissionSetting =
          payload.affiliateCommissionSetting || null;
        state.affiliateAdvantageSetting =
          payload.affiliateAdvantageSetting || null;
        state.affiliateRegistrationGuideSetting =
          payload.affiliateRegistrationGuideSetting || null;
        state.affiliateWatchSetting = payload.affiliateWatchSetting || null;
        state.affiliateReviewSetting = payload.affiliateReviewSetting || null;
        state.affiliateFooterSetting = payload.affiliateFooterSetting || null;
        state.affiliateNavbarSetting = payload.affiliateNavbarSetting || null;

        state.loading = false;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchAffiliateGlobalData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Affiliate global data load failed";
      });
  },
});

export const { clearGlobalData } = globalSlice.actions;

export default globalSlice.reducer;
