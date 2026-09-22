export const selectGlobalLoaded = (state) => state.global.loaded;
export const selectGlobalLoading = (state) => state.global.loading;
export const selectGlobalError = (state) => state.global.error;

export const selectSiteIdentify = (state) => state.global.siteIdentify;
export const selectNotice = (state) => state.global.notice;
export const selectSliders = (state) => state.global.sliders;
export const selectFavouriteBanners = (state) => state.global.favouriteBanners;
export const selectSocialLinks = (state) => state.global.socialLinks;
export const selectCheckInReward = (state) => state.global.checkInReward;
export const selectWheelReward = (state) => state.global.wheelReward;
export const selectDownloadHeader = (state) => state.global.downloadHeader;

export const selectFooterSetting = (state) => state.global.footerSetting;

export const selectNavbarColorSetting = (state) =>
  state.global.navbarColorSetting;

export const selectSidebarColorSetting = (state) =>
  state.global.sidebarColorSetting;

export const selectCategorySectionSetting = (state) =>
  state.global.categorySectionSetting;

export const selectRegisterModalSetting = (state) =>
  state.global.registerModalSetting;

export const selectLoginModalSetting = (state) =>
  state.global.loginModalSetting;

export const selectForgetPasswordModalSetting = (state) =>
  state.global.forgetPasswordModalSetting;

export const selectModalColorSetting = (state) =>
  state.global.modalColorSetting;

export const selectTransactionHistoryColorSetting = (state) =>
  state.global.transactionHistoryColorSetting;

export const selectBottomNavigationColorSetting = (state) =>
  state.global.bottomNavigationColorSetting;

export const selectHomePageContentColorSetting = (state) =>
  state.global.homePageContentColorSetting;
