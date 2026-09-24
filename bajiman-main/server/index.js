import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import affiliateProfileRoutes from "./routes/affiliateProfileRoutes.js";
import affWithdrawRoutes from "./routes/affWithdrawRoutes.js";
import bulkAdjustmentRoutes from "./routes/bulkAdjustmentRoutes.js";
import affWithdrawRequestRoutes from "./routes/affWithdrawRequestRoutes.js";

/* ✅ Deposit System Routes */
import depositMethodRoutes from "./routes/depositMethodRoutes.js";
import depositFieldRoutes from "./routes/depositFieldRoutes.js";
import depositBonusTurnoverRoutes from "./routes/depositBonusTurnoverRoutes.js";
import registerBonusCampaignRoutes from "./routes/registerBonusCampaignRoutes.js";
import turnoverRoutes from "./routes/turnoverRoutes.js";
import depositRequestRoutes from "./routes/depositRequestRoutes.js";
import adminManualDepositRoutes from "./routes/adminManualDepositRoutes.js";
import userInfoRoutes from "./routes/userInfoRoutes.js";
import autoDepositRoutes from "./routes/autoDepositRoutes.js";
import eWalletRoutes from "./routes/eWalletRoutes.js";
import withdrawMethodRoutes from "./routes/withdrawMethodRoutes.js";
import withdrawRequestRoutes from "./routes/withdrawRequestRoutes.js";
import gameCategoryRoutes from "./routes/gameCategoryRoutes.js";
import gameProviderRoutes from "./routes/gameProviderRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import sportRoutes from "./routes/sportRoutes.js";
import popularGameRoutes from "./routes/popularGameRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import favouriteBannerRoutes from "./routes/favouriteBannerRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import siteIdentifyRoutes from "./routes/siteIdentifyRoutes.js";
import affSiteIdentifyRoutes from "./routes/affSiteIdentifyRoutes.js";
import globalClientRoutes from "./routes/globalClientRoutes.js";
import hotGameRoutes from "./routes/hotGameRoutes.js";
import globalGameClientRoutes from "./routes/globalGameClientRoutes.js";
import playGameRoutes from "./routes/playGameRoutes.js";
import callbackRoutes from "./routes/callbackRoutes.js";
import gameHistoryRoutes from "./routes/gameHistoryRoutes.js";
import footerSettingRoutes from "./routes/footerSettingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import navbarColorSettingRoutes from "./routes/navbarColorSettingRoutes.js";
import sidebarColorSettingRoutes from "./routes/sidebarColorSettingRoutes.js";
import categorySectionSettingRoutes from "./routes/categorySectionSettingRoutes.js";
import registerModalSettingRoutes from "./routes/registerModalSettingRoutes.js";
import loginModalSettingRoutes from "./routes/loginModalSettingRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import otpSettingRoutes from "./routes/otpSettingRoutes.js";
import referRedeemAdminRoutes from "./routes/referRedeemAdminRoutes.js";
import referRedeemUserRoutes from "./routes/referRedeemUserRoutes.js";
import modalColorSettingRoutes from "./routes/modalColorSettingRoutes.js";
import transactionHistoryColorSettingRoutes from "./routes/transactionHistoryColorSettingRoutes.js";
import bottomNavigationColorSettingRoutes from "./routes/bottomNavigationColorSettingRoutes.js";
import homePageContentColorSettingRoutes from "./routes/homePageContentColorSettingRoutes.js";
import forgetPasswordModalSettingRoutes from "./routes/forgetPasswordModalSettingRoutes.js";
import socialLinkRoutes from "./routes/socialLinkRoutes.js";
import affiliateRegisterSettingRoutes from "./routes/affiliateRegisterSettingRoutes.js";
import affiliateGlobalRoutes from "./routes/affiliateGlobalRoutes.js";
import affiliateLoginSettingRoutes from "./routes/affiliateLoginSettingRoutes.js";
import affiliateSliderSettingRoutes from "./routes/affiliateSliderSettingRoutes.js";
import affiliateAgentSettingRoutes from "./routes/affiliateAgentSettingRoutes.js";
import affiliateAboutSettingRoutes from "./routes/affiliateAboutSettingRoutes.js";
import affiliateSponsorshipSettingRoutes from "./routes/affiliateSponsorshipSettingRoutes.js";
import affiliateCommissionSettingRoutes from "./routes/affiliateCommissionSettingRoutes.js";
import affiliateAdvantageSettingRoutes from "./routes/affiliateAdvantageSettingRoutes.js";
import affiliateRegistrationGuideSettingRoutes from "./routes/affiliateRegistrationGuideSettingRoutes.js";
import affiliateWatchSettingRoutes from "./routes/affiliateWatchSettingRoutes.js";
import affiliateReviewSettingRoutes from "./routes/affiliateReviewSettingRoutes.js";
import affiliateFooterSettingRoutes from "./routes/affiliateFooterSettingRoutes.js";
import affiliateNavbarSettingRoutes from "./routes/affiliateNavbarSettingRoutes.js";
import affiliateSocialLinkRoutes from "./routes/affiliateSocialLinkRoutes.js";
import gameApiKeyRoutes from "./routes/gameApiKeyRoutes.js";
import checkInRewardAdminRoutes from "./routes/checkInRewardAdminRoutes.js";
import checkInRewardClientRoutes from "./routes/checkInRewardClientRoutes.js";
import wheelRewardAdminRoutes from "./routes/wheelRewardAdminRoutes.js";
import wheelSpinRoutes from "./routes/wheelSpinRoutes.js";
import wheelTermsConditionRoutes from "./routes/wheelTermsConditionRoutes.js";
import downloadHeaderRoutes from "./routes/downloadHeaderRoutes.js";
import oracleSyncRoutes from "./routes/oracleSyncRoutes.js";
import nineWicketRoutes from "./routes/nineWicketRoutes.js";
import gameLaunchRoutes from "./routes/gameLaunchRoutes.js";
import providerRelayRoutes from "./routes/providerRelayRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";

dotenv.config();

const app = express();

// behind an nginx/Cloudflare reverse proxy — trust X-Forwarded-Proto so
// req.protocol/req.secure resolve to "https" correctly instead of "http"
app.set("trust proxy", 1);

// Eager connect for long-running servers (local/VPS). On Vercel the per-request
// middleware below establishes (and caches) the connection instead.
if (process.env.VERCEL !== "1") connectDB().catch(() => {});

// Credentialed cross-origin support: the client sends withCredentials, so a
// wildcard "*" origin is not allowed. When ALLOWED_ORIGINS is set (comma-
// separated, e.g. your real client domains), only those origins are reflected
// back. Requests without an Origin header (server-to-server, provider
// callbacks, curl) always pass. When ALLOWED_ORIGINS is empty (local dev),
// any origin is reflected.
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length) return callback(null, true);
      const norm = origin.replace(/\/+$/, "");
      const ok = allowedOrigins.includes(norm);
      console.log(`[CORS] origin=${JSON.stringify(origin)} norm=${JSON.stringify(norm)} allowed=${ok} list=${JSON.stringify(allowedOrigins)}`);
      return ok
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(process.env.VERCEL === "1" ? "/tmp/bajiman-uploads" : "uploads"),
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Crickex Server is running.",
  });
});

/* Existing Routes */
// Every /api route needs MongoDB. Await the (cached) connection so a cold
// serverless start never buffers-then-crashes; respond 503 JSON if Atlas is
// unreachable (e.g. Network Access not open to the host egress IPs).
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, message: "Database temporarily unavailable", detail: String(err?.message || err).slice(0, 300) });
  }
});
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/profile", affiliateProfileRoutes);
app.use("/api", affWithdrawRoutes);
app.use("/api", bulkAdjustmentRoutes);
app.use("/api", checkInRewardAdminRoutes);
app.use("/api", checkInRewardClientRoutes);
app.use("/api", wheelRewardAdminRoutes);
app.use("/api", wheelSpinRoutes);
app.use("/api", wheelTermsConditionRoutes);
app.use("/api", downloadHeaderRoutes);
app.use("/api", affWithdrawRequestRoutes);

/* ✅ Deposit System Routes */
app.use("/api/deposit-methods", depositMethodRoutes);
app.use("/api/deposit-fields", depositFieldRoutes);
app.use("/api/deposit-bonus-turnover", depositBonusTurnoverRoutes);
app.use("/api/register-bonus-campaigns", registerBonusCampaignRoutes);
app.use("/api/turnovers", turnoverRoutes);
app.use("/api/deposit-requests", depositRequestRoutes);
app.use("/api/admin/manual-deposits", adminManualDepositRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/auto-deposit", autoDepositRoutes);
app.use("/api/e-wallets", eWalletRoutes);
app.use("/api/withdraw-methods", withdrawMethodRoutes);
app.use("/api", withdrawRequestRoutes);

// Forget Password
app.use("/api/users/forgot-password", forgotPasswordRoutes);
app.use("/api/otp-setting", otpSettingRoutes);

// Refer and Reedeem
app.use("/api/admin/refer-redeem", referRedeemAdminRoutes);
app.use("/api/user/refer-redeem", referRedeemUserRoutes);

/* ✅ Game System Routes */
app.use("/api/game-categories", gameCategoryRoutes);
app.use("/api/game-providers", gameProviderRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/popular-games", popularGameRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/hot-games", hotGameRoutes);

// game Play system
app.use("/api/play-game", playGameRoutes);
// Provider-aware launch endpoint used by the current client. Legacy launch
// routes remain available below for older clients, but new launches must pass
// through catalog/provider validation before reaching a provider handler.
app.use("/api/game", gameLaunchRoutes);
app.use("/api/callback", callbackRoutes);
app.use("/api/game-history", gameHistoryRoutes);

// client site controller
app.use("/api/favourite-banners", favouriteBannerRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/site-identify", siteIdentifyRoutes);
app.use("/api/footer-settings", footerSettingRoutes);
app.use("/api/navbar-color-settings", navbarColorSettingRoutes);
app.use("/api/sidebar-color-settings", sidebarColorSettingRoutes);
app.use("/api/category-section-settings", categorySectionSettingRoutes);
app.use("/api/register-modal-settings", registerModalSettingRoutes);
app.use("/api/login-modal-settings", loginModalSettingRoutes);
app.use("/api/modal-color-settings", modalColorSettingRoutes);
app.use(
  "/api/transaction-history-color-settings",
  transactionHistoryColorSettingRoutes,
);
app.use(
  "/api/bottom-navigation-color-settings",
  bottomNavigationColorSettingRoutes,
);
app.use(
  "/api/home-page-content-color-settings",
  homePageContentColorSettingRoutes,
);
app.use(
  "/api/forget-password-modal-settings",
  forgetPasswordModalSettingRoutes,
);
app.use("/api/social-link", socialLinkRoutes);

// Affiliate Site Controller
app.use("/api/aff-site-identify", affSiteIdentifyRoutes);
app.use("/api/affiliate-register-settings", affiliateRegisterSettingRoutes);
app.use("/api/affiliate-login-settings", affiliateLoginSettingRoutes);
app.use("/api/affiliate-slider-settings", affiliateSliderSettingRoutes);
app.use("/api/affiliate-agent-settings", affiliateAgentSettingRoutes);
app.use("/api/affiliate-about-settings", affiliateAboutSettingRoutes);
app.use(
  "/api/affiliate-sponsorship-settings",
  affiliateSponsorshipSettingRoutes,
);
app.use("/api/affiliate-commission-settings", affiliateCommissionSettingRoutes);
app.use("/api/affiliate-advantage-settings", affiliateAdvantageSettingRoutes);
app.use(
  "/api/affiliate-registration-guide-settings",
  affiliateRegistrationGuideSettingRoutes,
);
app.use("/api/affiliate-watch-settings", affiliateWatchSettingRoutes);
app.use("/api/affiliate-review-settings", affiliateReviewSettingRoutes);
app.use("/api/affiliate-footer-settings", affiliateFooterSettingRoutes);
app.use("/api/affiliate-navbar-settings", affiliateNavbarSettingRoutes);
app.use("/api/affiliate-social-link", affiliateSocialLinkRoutes);


// Affiliate site Global Routes
app.use("/api/affiliate-global", affiliateGlobalRoutes);


// global client site Routes
app.use("/api/global/client", globalClientRoutes);

// global game routes client site
app.use("/api/global/client", globalGameClientRoutes);
app.use("/api/admin/game-api-key", gameApiKeyRoutes);
app.use("/api/admin/oracle-sync", oracleSyncRoutes);
app.use("/api/9wicket", nineWicketRoutes);
app.use("/api/provider-relay", providerRelayRoutes);
// Backward-compatible callback path used by WORLD_CASINO_* configuration.
app.use("/api/callback/9wicket", nineWicketRoutes);

// admin pannel Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Public country / dial-code list (server-side, avoids browser CORS)
app.use("/api/countries", countryRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Crickex Server running on port ${PORT}`);
  });
}

export default app;
