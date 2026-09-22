import express from "express";

import AffiliateRegisterSetting from "../models/AffiliateRegisterSetting.js";
import AffiliateLoginSetting from "../models/AffiliateLoginSetting.js";
import AffiliateSliderSetting from "../models/AffiliateSliderSetting.js";
import AffiliateAgentSetting from "../models/AffiliateAgentSetting.js";
import AffiliateAboutSetting from "../models/AffiliateAboutSetting.js";
import AffiliateSponsorshipSetting from "../models/AffiliateSponsorshipSetting.js";
import AffiliateCommissionSetting from "../models/AffiliateCommissionSetting.js";
import AffiliateAdvantageSetting from "../models/AffiliateAdvantageSetting.js";
import AffiliateRegistrationGuideSetting from "../models/AffiliateRegistrationGuideSetting.js";
import AffiliateWatchSetting from "../models/AffiliateWatchSetting.js";
import AffiliateReviewSetting from "../models/AffiliateReviewSetting.js";
import AffiliateFooterSetting from "../models/AffiliateFooterSetting.js";
import AffiliateNavbarSetting from "../models/AffiliateNavbarSetting.js";
import AffSiteIdentify from "../models/AffSiteIdentify.js";
import AffiliateSocialLink from "../models/AffiliateSocialLink.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatAffiliateRegisterSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    notes: Array.isArray(obj.notes)
      ? obj.notes
          .filter((note) => note?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

const formatAffiliateLoginSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    features: Array.isArray(obj.features)
      ? obj.features
          .filter((feature) => feature?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

const formatAffiliateSliderSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    bgImageUrl: obj.bgImage ? buildFileUrl(req, obj.bgImage) : "",
    slides: Array.isArray(obj.slides)
      ? obj.slides
          .filter((slide) => slide?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((slide) => ({
            ...slide,
            imageUrl: slide.image ? buildFileUrl(req, slide.image) : "",
          }))
      : [],
  };
};

const formatAffiliateAgentSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    backgroundImageUrl: obj.backgroundImage
      ? buildFileUrl(req, obj.backgroundImage)
      : "",
    rightImageUrl: obj.rightImage ? buildFileUrl(req, obj.rightImage) : "",
  };
};

const formatAffiliateAboutSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
  };
};

const formatAffiliateSponsorshipSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    sponsors: Array.isArray(obj.sponsors)
      ? obj.sponsors
          .filter((sponsor) => sponsor?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((sponsor) => ({
            ...sponsor,
            imageUrl: sponsor.image ? buildFileUrl(req, sponsor.image) : "",
          }))
      : [],
  };
};

const formatAffiliateCommissionSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    flowItems: Array.isArray(obj.flowItems)
      ? obj.flowItems
          .filter((flow) => flow?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((flow) => ({
            ...flow,
            imageUrl: flow.image ? buildFileUrl(req, flow.image) : "",
          }))
      : [],
    tableRows: Array.isArray(obj.tableRows)
      ? obj.tableRows
          .filter((row) => row?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

const formatAffiliateAdvantageSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    cards: Array.isArray(obj.cards)
      ? obj.cards
          .filter((card) => card?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((card) => ({
            ...card,
            iconUrl: card.icon ? buildFileUrl(req, card.icon) : "",
          }))
      : [],
  };
};

const formatAffiliateRegistrationGuideSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    cards: Array.isArray(obj.cards)
      ? obj.cards
          .filter((card) => card?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((card) => ({
            ...card,
            iconUrl: card.icon ? buildFileUrl(req, card.icon) : "",
          }))
      : [],
  };
};

const extractYoutubeId = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";

  if (/^[a-zA-Z0-9_-]{6,}$/.test(text) && !text.includes("/")) {
    return text;
  }

  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
};

const formatAffiliateWatchSetting = (item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;
  const id = obj.videoId || extractYoutubeId(obj.videoUrl);

  return {
    ...obj,
    embedUrl: id ? `https://www.youtube.com/embed/${id}` : "",
  };
};

const formatAffiliateReviewSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    reviews: Array.isArray(obj.reviews)
      ? obj.reviews
          .filter((review) => review?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((review) => ({
            ...review,
            logoUrl: review.logo ? buildFileUrl(req, review.logo) : "",
          }))
      : [],
  };
};

const formatAffiliateFooterSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
    links: Array.isArray(obj.links)
      ? obj.links
          .filter((link) => link?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
    socials: Array.isArray(obj.socials)
      ? obj.socials
          .filter((social) => social?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((social) => ({
            ...social,
            iconUrl: social.icon ? buildFileUrl(req, social.icon) : "",
          }))
      : [],
  };
};

const formatAffiliateNavbarSetting = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoUrl: obj.logo ? buildFileUrl(req, obj.logo) : "",
  };
};

const formatAffSiteIdentify = (req, item) => {
  if (!item) return null;
  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    logoImageUrl: obj.logoImage ? buildFileUrl(req, obj.logoImage) : "",
    faviconImageUrl: obj.faviconImage
      ? buildFileUrl(req, obj.faviconImage)
      : "",
    backgroundImageUrl: obj.backgroundImage
      ? buildFileUrl(req, obj.backgroundImage)
      : "",
  };
};

const formatAffiliateSocialLink = (req, item) => {
  if (!item) return null;

  const obj = item?.toObject ? item.toObject() : item;

  return {
    ...obj,
    iconUrl: obj.icon ? buildFileUrl(req, obj.icon) : "",
  };
};

/* GET /api/affiliate-global/client/site-data */
router.get("/client/site-data", async (req, res) => {
  try {
    const [
      affSiteIdentify,
      affiliateSocialLinks,
      affiliateRegisterSetting,
      affiliateLoginSetting,
      affiliateSliderSetting,
      affiliateAgentSetting,
      affiliateAboutSetting,
      affiliateSponsorshipSetting,
      affiliateCommissionSetting,
      affiliateAdvantageSetting,
      affiliateRegistrationGuideSetting,
      affiliateWatchSetting,
      affiliateReviewSetting,
      affiliateFooterSetting,
      affiliateNavbarSetting,
    ] = await Promise.all([
      AffSiteIdentify.findOne({ status: "active" }).sort({ createdAt: -1 }),

      AffiliateSocialLink.find({ status: "active" }).sort({
        order: 1,
        createdAt: -1,
      }),

      AffiliateRegisterSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateLoginSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateSliderSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateAgentSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateAboutSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateSponsorshipSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateCommissionSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateAdvantageSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateRegistrationGuideSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateWatchSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateReviewSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateFooterSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
      AffiliateNavbarSetting.findOne({ status: "active" }).sort({
        createdAt: -1,
      }),
    ]);

    return successResponse(res, "Affiliate global data fetched successfully", {
      affSiteIdentify: formatAffSiteIdentify(req, affSiteIdentify),
      affiliateRegisterSetting: formatAffiliateRegisterSetting(
        req,
        affiliateRegisterSetting,
      ),
      affiliateLoginSetting: formatAffiliateLoginSetting(
        req,
        affiliateLoginSetting,
      ),
      affiliateSliderSetting: formatAffiliateSliderSetting(
        req,
        affiliateSliderSetting,
      ),
      affiliateAgentSetting: formatAffiliateAgentSetting(
        req,
        affiliateAgentSetting,
      ),
      affiliateAboutSetting: formatAffiliateAboutSetting(
        req,
        affiliateAboutSetting,
      ),
      affiliateSponsorshipSetting: formatAffiliateSponsorshipSetting(
        req,
        affiliateSponsorshipSetting,
      ),
      affiliateCommissionSetting: formatAffiliateCommissionSetting(
        req,
        affiliateCommissionSetting,
      ),
      affiliateAdvantageSetting: formatAffiliateAdvantageSetting(
        req,
        affiliateAdvantageSetting,
      ),
      affiliateRegistrationGuideSetting:
        formatAffiliateRegistrationGuideSetting(
          req,
          affiliateRegistrationGuideSetting,
        ),
      affiliateWatchSetting: formatAffiliateWatchSetting(affiliateWatchSetting),
      affiliateReviewSetting: formatAffiliateReviewSetting(
        req,
        affiliateReviewSetting,
      ),
      affiliateFooterSetting: formatAffiliateFooterSetting(
        req,
        affiliateFooterSetting,
      ),
      affiliateNavbarSetting: formatAffiliateNavbarSetting(
        req,
        affiliateNavbarSetting,
      ),
      affSiteIdentify: formatAffSiteIdentify(req, affSiteIdentify),

      affiliateSocialLinks: Array.isArray(affiliateSocialLinks)
        ? affiliateSocialLinks.map((item) =>
            formatAffiliateSocialLink(req, item),
          )
        : [],
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
