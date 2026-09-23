import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Home from "../pages/Home/Home";
import Deposit from "../pages/Deposit/Deposit";
import Withdraw from "../pages/Withdraw/Withdraw";
import Login from "../pages/Login/Login";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import AllAffiliateUser from "../pages/AllAffiliateUser/AllAffiliateUser";
import SingleAffiliateDetails from "../pages/SingleAffiliateDetails/SingleAffiliateDetails";
import AllUser from "../pages/AllUser/AllUser";
import SingleUserDetails from "../pages/SingleUserDetails/SingleUserDetails";
import AddAffWithdrawMethod from "../pages/AddAffWithdrawMethod/AddAffWithdrawMethod";
import BulkAdjustment from "../pages/BulkAdjustment/BulkAdjustment";
import AffWithdrawRequests from "../pages/AffWithdrawRequests/AffWithdrawRequests";
import AffWithdrawRequestDetails from "../pages/AffWithdrawRequestDetails/AffWithdrawRequestDetails";

import AddDepositMethod from "../pages/AddDepositMethod/AddDepositMethod";
import AddDepositField from "../pages/AddDepositField/AddDepositField";
import AddDepositBonusTurnover from "../pages/AddDepositBonusTurnover/AddDepositBonusTurnover";
import OtpSetting from "../pages/OtpSetting/OtpSetting";
import RegisterBonusCampaign from "../pages/RegisterBonusCampaign/RegisterBonusCampaign";
import ManualDeposit from "../pages/ManualDeposit/ManualDeposit";
import DepositRequests from "../pages/DepositRequests/DepositRequests";
import DepositRequestDetails from "../pages/DepositRequestDetails/DepositRequestDetails";
import AutoDepositSettings from "../pages/AutoDepositSettings/AutoDepositSettings";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import WithdrawRequest from "../pages/WithdrawRequest/WithdrawRequest";
import WithdrawRequestDetails from "../pages/WithdrawRequestDetails/WithdrawRequestDetails";

// game router
// import GameCategory from "../pages/GameCategory/GameCategory";
import GameProvider from "../pages/GameProvider/GameProvider";
// import Game from "../pages/Game/Game";
// import Sport from "../pages/Sport/Sport";
// import AddPopularGame from "../pages/AddPopularGame/AddPopularGame";
// import AddHotGame from "../pages/AddHotGame/AddHotGame";

import AllGameHistory from "../pages/AllGameHistory/AllGameHistory";
import AddPromotion from "../pages/AddPromotion/AddPromotion";
import AddFavouriteBanner from "../pages/AddFavouriteBanner/AddFavouriteBanner";
import AddSlider from "../pages/AddSlider/AddSlider";
import AddNotice from "../pages/AddNotice/AddNotice";
import SiteIdentify from "../pages/SiteIdentify/SiteIdentify";
import AffSiteIdentify from "../pages/AffSiteIdentify/AffSiteIdentify";

import FooterSetting from "../pages/FooterSetting/FooterSetting";
import AllTurnOverHistory from "../pages/AllTurnOverHistory/AllTurnOverHistory";
import NavbarColorSetting from "../pages/NavbarColorSetting/NavbarColorSetting";
import SidebarColorSetting from "../pages/SidebarColorSetting/SidebarColorSetting";
import CategorySectionSetting from "../pages/CategorySectionSetting/CategorySectionSetting";
import RegisterModalSetting from "../pages/RegisterModalSetting/RegisterModalSetting";
import LoginModalSetting from "../pages/LoginModalSetting/LoginModalSetting";
import UserReferRedeem from "../pages/UserReferRedeem/UserReferRedeem";
import ModalColorSetting from "../pages/ModalColorSetting/ModalColorSetting";
import TransactionHistoryColorSetting from "../pages/TransactionHistoryColorSetting/TransactionHistoryColorSetting";
import BottomNavigationColorSetting from "../pages/BottomNavigationColorSetting/BottomNavigationColorSetting";
import HomePageContentColorSetting from "../pages/HomePageContentColorSetting/HomePageContentColorSetting";
import ForgetPasswordModalSetting from "../pages/ForgetPasswordModalSetting/ForgetPasswordModalSetting";
import AddSocialLink from "../pages/AddSocialLink/AddSocialLink";
import CheckInReward from "../pages/CheckInReward/CheckInReward";
import WheelOfFortuneReward from "../pages/WheelOfFortuneReward/WheelOfFortuneReward";
import WheelTermsCondition from "../pages/WheelTermsCondition/WheelTermsCondition";
import RewardHistory from "../pages/RewardHistory/RewardHistory";
import DownloadHeaderController from "../pages/DownloadHeaderController/DownloadHeaderController";
import AffiliateRegisterSetting from "../pages/AffiliateRegisterSetting/AffiliateRegisterSetting";
import AffiliateLoginSetting from "../pages/AffiliateLoginSetting/AffiliateLoginSetting";
import AffiliateSliderSetting from "../pages/AffiliateSliderSetting/AffiliateSliderSetting";
import AffiliateAgentSetting from "../pages/AffiliateAgentSetting/AffiliateAgentSetting";
import AffiliateAboutSetting from "../pages/AffiliateAboutSetting/AffiliateAboutSetting";
import AffiliateSponsorshipSetting from "../pages/AffiliateSponsorshipSetting/AffiliateSponsorshipSetting";
import AffiliateCommissionSetting from "../pages/AffiliateCommissionSetting/AffiliateCommissionSetting";
import AffiliateAdvantageSetting from "../pages/AffiliateAdvantageSetting/AffiliateAdvantageSetting";
import AffiliateRegistrationGuideSetting from "../pages/AffiliateRegistrationGuideSetting/AffiliateRegistrationGuideSetting";
import AffiliateWatchSetting from "../pages/AffiliateWatchSetting/AffiliateWatchSetting";
import AffiliateReviewSetting from "../pages/AffiliateReviewSetting/AffiliateReviewSetting";
import AffiliateFooterSetting from "../pages/AffiliateFooterSetting/AffiliateFooterSetting";
import AffiliateNavbarSetting from "../pages/AffiliateNavbarSetting/AffiliateNavbarSetting";
import AddAffiliateSocialLink from "../pages/AddAffiliateSocialLink/AddAffiliateSocialLink";
import AddGameApiKey from "../pages/AddGameApiKey/AddGameApiKey";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="profile">
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute permKey="create-admin">
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-users",
        element: (
          <PrivateRoute permKey="all-affiliate-users">
            <AllAffiliateUser />
          </PrivateRoute>
        ),
      },
      {
        path: "single-affiliate-details/:id",
        element: (
          <PrivateRoute permKey="single-affiliate-details">
            <SingleAffiliateDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "all-users",
        element: (
          <PrivateRoute permKey="all-users">
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "single-user-details/:id",
        element: (
          <PrivateRoute permKey="single-user-details">
            <SingleUserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "user-refer-redeem",
        element: (
          <PrivateRoute permKey="user-refer-redeem">
            <UserReferRedeem />
          </PrivateRoute>
        ),
      },
      {
        path: "add-aff-withdraw-method",
        element: (
          <PrivateRoute permKey="add-aff-withdraw-method">
            <AddAffWithdrawMethod />
          </PrivateRoute>
        ),
      },
      {
        path: "bulk-adjustment",
        element: (
          <PrivateRoute permKey="bulk-adjustment">
            <BulkAdjustment />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-withdraw-requests",
        element: (
          <PrivateRoute permKey="aff-withdraw-requests">
            <AffWithdrawRequests />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-withdraw-requests-details/:id",
        element: (
          <PrivateRoute permKey="aff-withdraw-requests-details">
            <AffWithdrawRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-method",
        element: (
          <PrivateRoute permKey="add-deposit-method">
            <AddDepositMethod />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-field",
        element: (
          <PrivateRoute permKey="add-deposit-field">
            <AddDepositField />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-bonus-turnover",
        element: (
          <PrivateRoute permKey="add-deposit-bonus-turnover">
            <AddDepositBonusTurnover />
          </PrivateRoute>
        ),
      },
      {
        path: "otp-setting",
        element: (
          <PrivateRoute permKey="otp-setting">
            <OtpSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "register-bonus-campaign",
        element: (
          <PrivateRoute permKey="register-bonus-campaign">
            <RegisterBonusCampaign />
          </PrivateRoute>
        ),
      },
      {
        path: "manual-deposit",
        element: (
          <PrivateRoute permKey="manual-deposit">
            <ManualDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-requests",
        element: (
          <PrivateRoute permKey="deposit-requests">
            <DepositRequests />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-request-details/:id",
        element: (
          <PrivateRoute permKey="deposit-request-details">
            <DepositRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-settings",
        element: (
          <PrivateRoute permKey="auto-deposit-settings">
            <AutoDepositSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-history",
        element: (
          <PrivateRoute permKey="auto-deposit-history">
            <AutoDepositHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-requests",
        element: (
          <PrivateRoute permKey="withdraw-requests">
            <WithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-request-details/:id",
        element: (
          <PrivateRoute permKey="withdraw-requests">
            <WithdrawRequestDetails />
          </PrivateRoute>
        ),
      },

      // {
      //   path: "add-category",
      //   element: (
      //     <PrivateRoute permKey="add-category">
      //       <GameCategory />
      //     </PrivateRoute>
      //   ),
      // },
      {
        path: "add-provider",
        element: (
          <PrivateRoute permKey="add-provider">
            <GameProvider />
          </PrivateRoute>
        ),
      },
      // {
      //   path: "add-game",
      //   element: (
      //     <PrivateRoute permKey="add-game">
      //       <Game />
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "add-sport-game",
      //   element: (
      //     <PrivateRoute permKey="add-sport-game">
      //       <Sport />
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "add-popular-game",
      //   element: (
      //     <PrivateRoute permKey="add-popular-game">
      //       <AddPopularGame />
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "add-hot-game",
      //   element: (
      //     <PrivateRoute permKey="add-hot-game">
      //       <AddHotGame />
      //     </PrivateRoute>
      //   ),
      // },
      {
        path: "add-game-api-key",
        element: (
          <PrivateRoute permKey="add-game-api-key">
            <AddGameApiKey />
          </PrivateRoute>
        ),
      },
      {
        path: "all-game-history",
        element: (
          <PrivateRoute permKey="add-game-history">
            <AllGameHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "all-turnover-history",
        element: (
          <PrivateRoute permKey="add-turnover-history">
            <AllTurnOverHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-promotion",
        element: (
          <PrivateRoute permKey="add-promotion">
            <AddPromotion />
          </PrivateRoute>
        ),
      },
      {
        path: "add-favorite-banner",
        element: (
          <PrivateRoute permKey="add-favorite-banner">
            <AddFavouriteBanner />
          </PrivateRoute>
        ),
      },
      {
        path: "client-slider-control",
        element: (
          <PrivateRoute permKey="client-slider-control">
            <AddSlider />
          </PrivateRoute>
        ),
      },
      {
        path: "footer-setting",
        element: (
          <PrivateRoute permKey="footer-setting">
            <FooterSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "navbar-color-setting",
        element: (
          <PrivateRoute permKey="navbar-color-setting">
            <NavbarColorSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "sidebar-color-setting",
        element: (
          <PrivateRoute permKey="sidebar-color-setting">
            <SidebarColorSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "category-section-setting",
        element: (
          <PrivateRoute permKey="category-section-setting">
            <CategorySectionSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "register-modal-setting",
        element: (
          <PrivateRoute permKey="register-modal-setting">
            <RegisterModalSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "login-modal-setting",
        element: (
          <PrivateRoute permKey="login-modal-setting">
            <LoginModalSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "add-notice-control",
        element: (
          <PrivateRoute permKey="add-notice-control">
            <AddNotice />
          </PrivateRoute>
        ),
      },
      {
        path: "client-site-identify",
        element: (
          <PrivateRoute permKey="client-site-identify">
            <SiteIdentify />
          </PrivateRoute>
        ),
      },
      {
        path: "modal-color-setting",
        element: (
          <PrivateRoute permKey="modal-color-setting">
            <ModalColorSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "transaction-history-color-setting",
        element: (
          <PrivateRoute permKey="transaction-history-color-setting">
            <TransactionHistoryColorSetting />
          </PrivateRoute>
        ),
      },

      {
        path: "bottom-navigation-color-setting",
        element: (
          <PrivateRoute permKey="bottom-navigation-color-setting">
            <BottomNavigationColorSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "home-page-content-color-setting",
        element: (
          <PrivateRoute permKey="home-page-content-color-setting">
            <HomePageContentColorSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "forget-password-modal-setting",
        element: (
          <PrivateRoute permKey="forget-password-modal-setting">
            <ForgetPasswordModalSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "social-link",
        element: (
          <PrivateRoute permKey="social-link">
            <AddSocialLink />
          </PrivateRoute>
        ),
      },
      {
        path: "download-header",
        element: (
          <PrivateRoute permKey="download-header">
            <DownloadHeaderController />
          </PrivateRoute>
        ),
      },
      {
        path: "check-in-reward",
        element: (
          <PrivateRoute permKey="check-in-reward">
            <CheckInReward />
          </PrivateRoute>
        ),
      },
      {
        path: "wheel-of-fortune-reward",
        element: (
          <PrivateRoute permKey="wheel-of-fortune-reward">
            <WheelOfFortuneReward />
          </PrivateRoute>
        ),
      },
      {
        path: "wheel-terms-condition",
        element: (
          <PrivateRoute permKey="wheel-terms-condition">
            <WheelTermsCondition />
          </PrivateRoute>
        ),
      },
      {
        path: "reward-history",
        element: (
          <PrivateRoute permKey="reward-history">
            <RewardHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "client-aff-site-identify",
        element: (
          <PrivateRoute permKey="client-aff-site-identify">
            <AffSiteIdentify />
          </PrivateRoute>
        ),
      },
      {
        path: "client-aff-social-link",
        element: (
          <PrivateRoute permKey="client-aff-social-link">
            <AddAffiliateSocialLink />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-register-setting",
        element: (
          <PrivateRoute permKey="affiliate-register-setting">
            <AffiliateRegisterSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-login-setting",
        element: (
          <PrivateRoute permKey="affiliate-login-setting">
            <AffiliateLoginSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-slider-setting",
        element: (
          <PrivateRoute permKey="affiliate-slider-setting">
            <AffiliateSliderSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-agent-setting",
        element: (
          <PrivateRoute permKey="affiliate-agent-setting">
            <AffiliateAgentSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-about-setting",
        element: (
          <PrivateRoute permKey="affiliate-about-setting">
            <AffiliateAboutSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-sponsorship-setting",
        element: (
          <PrivateRoute permKey="affiliate-sponsorship-setting">
            <AffiliateSponsorshipSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-commission-setting",
        element: (
          <PrivateRoute permKey="affiliate-commission-setting">
            <AffiliateCommissionSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-advantage-setting",
        element: (
          <PrivateRoute permKey="affiliate-advantage-setting">
            <AffiliateAdvantageSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-registration-guide-setting",
        element: (
          <PrivateRoute permKey="affiliate-registration-guide-setting">
            <AffiliateRegistrationGuideSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-watch-setting",
        element: (
          <PrivateRoute permKey="affiliate-watch-setting">
            <AffiliateWatchSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-review-setting",
        element: (
          <PrivateRoute permKey="affiliate-review-setting">
            <AffiliateReviewSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-footer-setting",
        element: (
          <PrivateRoute permKey="affiliate-footer-setting">
            <AffiliateFooterSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-navbar-setting",
        element: (
          <PrivateRoute permKey="affiliate-navbar-setting">
            <AffiliateNavbarSetting />
          </PrivateRoute>
        ),
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
