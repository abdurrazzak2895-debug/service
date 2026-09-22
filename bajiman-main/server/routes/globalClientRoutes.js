import express from "express";

import SiteIdentify from "../models/SiteIdentify.js";
import Notice from "../models/Notice.js";
import Slider from "../models/Slider.js";
import FavouriteBanner from "../models/FavouriteBanner.js";
import FooterSetting from "../models/FooterSetting.js";
import NavbarColorSetting from "../models/NavbarColorSetting.js";
import SidebarColorSetting from "../models/SidebarColorSetting.js";
import CategorySectionSetting from "../models/CategorySectionSetting.js";
import RegisterModalSetting from "../models/RegisterModalSetting.js";
import LoginModalSetting from "../models/LoginModalSetting.js";
import ModalColorSetting from "../models/ModalColorSetting.js";
import TransactionHistoryColorSetting from "../models/TransactionHistoryColorSetting.js";
import BottomNavigationColorSetting from "../models/BottomNavigationColorSetting.js";
import HomePageContentColorSetting from "../models/HomePageContentColorSetting.js";
import ForgetPasswordModalSetting from "../models/ForgetPasswordModalSetting.js";
import SocialLink from "../models/SocialLink.js";
import CheckInRewardSetting from "../models/CheckInRewardSetting.js";
import WheelTermsCondition from "../models/WheelTermsCondition.js";
import DownloadHeader from "../models/DownloadHeader.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatSiteIdentify = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    logoUrl: item.logo ? buildFileUrl(req, item.logo) : "",
    faviconUrl: item.favicon ? buildFileUrl(req, item.favicon) : "",
  };
};

const formatSlider = (req, item) => {
  return {
    ...item,
    desktopImageUrl: item.desktopImage
      ? buildFileUrl(req, item.desktopImage)
      : "",
    mobileImageUrl: item.mobileImage ? buildFileUrl(req, item.mobileImage) : "",
  };
};

const formatFavouriteBanner = (req, item) => {
  return {
    ...item,
    imageUrl: item.image ? buildFileUrl(req, item.image) : "",
  };
};

const formatFooterSetting = (req, footer) => {
  if (!footer) return null;

  return {
    ...footer,

    footerLogoUrl: footer.footerLogo
      ? buildFileUrl(req, footer.footerLogo)
      : "",

    officialPartnerImageUrl: footer.officialPartnerImage
      ? buildFileUrl(req, footer.officialPartnerImage)
      : "",

    paymentMethods: Array.isArray(footer.paymentMethods)
      ? footer.paymentMethods
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    socials: Array.isArray(footer.socials)
      ? footer.socials
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],

    sponsors: Array.isArray(footer.sponsors)
      ? footer.sponsors
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    ambassadors: Array.isArray(footer.ambassadors)
      ? footer.ambassadors
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    links: Array.isArray(footer.links)
      ? footer.links
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

const formatCategorySectionSetting = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    hotImageUrl: item.hotImage
      ? `${req.protocol}://${req.get("host")}/${String(item.hotImage).replace(/^\/+/, "")}`
      : "",
    sportsImageUrl: item.sportsImage
      ? `${req.protocol}://${req.get("host")}/${String(item.sportsImage).replace(/^\/+/, "")}`
      : "",
  };
};

const formatRegisterModalSetting = (req, item) => {
  if (!item) return null;

  const buildUrl = (filePath = "") => {
    if (!filePath) return "";
    if (String(filePath).startsWith("http")) return filePath;
    const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
    return `${req.protocol}://${req.get("host")}/${normalized}`;
  };

  return {
    ...item,
    logoUrl: item.logo ? buildUrl(item.logo) : "",
    sliderImages: Array.isArray(item.sliderImages)
      ? item.sliderImages
          .filter((slide) => slide?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((slide) => ({
            ...slide,
            imageUrl: slide.image ? buildUrl(slide.image) : "",
          }))
      : [],
  };
};

const formatLoginModalSetting = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    logoUrl: item.logo ? buildFileUrl(req, item.logo) : "",
  };
};

const formatForgetPasswordModalSetting = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    logoUrl: item.logo ? buildFileUrl(req, item.logo) : "",
  };
};

const formatSocialLink = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    iconUrl: item.icon ? buildFileUrl(req, item.icon) : "",
  };
};

const formatCheckInReward = (req, item) => {
  if (!item) return { launcherIconUrl: "", isActive: false };

  return {
    launcherIconUrl: item.launcherIcon
      ? buildFileUrl(req, item.launcherIcon)
      : "",
    isActive: item.isActive === true,
  };
};

const formatWheelReward = (req, item) => {
  if (!item) return { launcherIconUrl: "", isActive: false };

  return {
    launcherIconUrl: item.launcherIcon
      ? buildFileUrl(req, item.launcherIcon)
      : "",
    isActive: item.isActive === true,
  };
};

const formatDownloadHeader = (req, item) => {
  if (!item) return null;

  return {
    isActive: item.isActive === true,
    appNameBn: item.appNameBn || "",
    appNameEn: item.appNameEn || "",
    titleBn: item.titleBn || "",
    titleEn: item.titleEn || "",
    btnTextBn: item.btnTextBn || "",
    btnTextEn: item.btnTextEn || "",
    iconUrl: item.iconUrl ? buildFileUrl(req, item.iconUrl) : "",
    apkUrl: item.apkUrl ? buildFileUrl(req, item.apkUrl) : "",
  };
};

router.get("/site-data", async (req, res) => {
  try {
    const [
      siteIdentify,
      notice,
      sliders,
      favouriteBanners,
      footerSetting,
      navbarColorSetting,
      sidebarColorSetting,
      categorySectionSetting,
      registerModalSetting,
      loginModalSetting,
      modalColorSetting,
      transactionHistoryColorSetting,
      bottomNavigationColorSetting,
      homePageContentColorSetting,
      forgetPasswordModalSetting,
      socialLinks,
      checkInRewardSetting,
      wheelTermsSetting,
      downloadHeaderSetting,
    ] = await Promise.all([
      SiteIdentify.findOne({ status: "active" }).sort({ createdAt: -1 }).lean(),
      Notice.findOne({ status: "active" }).sort({ createdAt: -1 }).lean(),
      Slider.find({ status: "active" })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      FavouriteBanner.find({ status: "active" })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      FooterSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      NavbarColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      SidebarColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      CategorySectionSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      RegisterModalSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      LoginModalSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      ModalColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      TransactionHistoryColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      BottomNavigationColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      HomePageContentColorSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      ForgetPasswordModalSetting.findOne({ status: "active" })
        .sort({ createdAt: -1 })
        .lean(),

      SocialLink.find({
        status: "active",
      })
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean(),

      CheckInRewardSetting.findOne({ settingKey: "global" })
        .select("launcherIcon isActive")
        .lean(),

      WheelTermsCondition.findOne({ settingKey: "wheel-terms-condition" })
        .select("launcherIcon isActive")
        .lean(),

      DownloadHeader.findOne().lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Global site data loaded successfully.",
      data: {
        siteIdentify: formatSiteIdentify(req, siteIdentify),
        notice,
        sliders: sliders.map((item) => formatSlider(req, item)),
        favouriteBanners: favouriteBanners.map((item) =>
          formatFavouriteBanner(req, item),
        ),
        footerSetting: formatFooterSetting(req, footerSetting),
        navbarColorSetting,
        sidebarColorSetting,
        categorySectionSetting: formatCategorySectionSetting(
          req,
          categorySectionSetting,
        ),
        registerModalSetting: formatRegisterModalSetting(
          req,
          registerModalSetting,
        ),
        loginModalSetting: formatLoginModalSetting(req, loginModalSetting),
        forgetPasswordModalSetting: formatForgetPasswordModalSetting(
          req,
          forgetPasswordModalSetting,
        ),
        socialLinks: socialLinks.map((item) => formatSocialLink(req, item)),
        checkInReward: formatCheckInReward(req, checkInRewardSetting),
        wheelReward: formatWheelReward(req, wheelTermsSetting),
        downloadHeader: formatDownloadHeader(req, downloadHeaderSetting),
        modalColorSetting,
        transactionHistoryColorSetting,
        bottomNavigationColorSetting,
        homePageContentColorSetting,
      },
    });
  } catch (error) {
    console.error("GLOBAL SITE DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load global site data.",
    });
  }
});

export default router;
