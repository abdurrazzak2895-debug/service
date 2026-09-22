import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import FooterSetting from "../models/FooterSetting.js";
import upload from "../config/multer.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const colorFields = [
  "footerBg",
  "footerText",
  "sectionTitleText",
  "dividerBg",

  "socialIconBg",
  "socialIconText",

  "linkBorder",
  "linkText",

  "descriptionTitleText",
  "descriptionText",

  "readMoreButtonBg",
  "readMoreButtonText",

  "qualityTitleText",
  "copyrightTextColor",

  "itemTitleText",
  "itemSubText",
];

const filePath = (file) => {
  if (!file) return "";
  return file.path.replace(/\\/g, "/");
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const deleteLocalFile = (oldPath = "") => {
  try {
    if (!oldPath) return;
    if (String(oldPath).startsWith("http")) return;

    const fullPath = path.resolve(oldPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FOOTER FILE DELETE ERROR:", error.message);
  }
};

const parseJson = (value, fallback) => {
  try {
    if (typeof value === "undefined") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeLocalized = (value = {}) => ({
  bn: cleanText(value?.bn),
  en: cleanText(value?.en),
});

const normalizeList = (value = []) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => ({
    ...item,
    order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
    status: item?.status === "inactive" ? "inactive" : "active",
  }));
};

const addImageUrls = (req, item) => {
  const obj = item?.toObject ? item.toObject() : item || {};

  return {
    ...obj,

    footerLogoUrl: obj.footerLogo ? buildFileUrl(req, obj.footerLogo) : "",
    officialPartnerImageUrl: obj.officialPartnerImage
      ? buildFileUrl(req, obj.officialPartnerImage)
      : "",

    paymentMethods: Array.isArray(obj.paymentMethods)
      ? obj.paymentMethods.map((x) => ({
          ...x,
          imageUrl: x.image ? buildFileUrl(req, x.image) : "",
        }))
      : [],

    sponsors: Array.isArray(obj.sponsors)
      ? obj.sponsors.map((x) => ({
          ...x,
          imageUrl: x.image ? buildFileUrl(req, x.image) : "",
        }))
      : [],

    ambassadors: Array.isArray(obj.ambassadors)
      ? obj.ambassadors.map((x) => ({
          ...x,
          imageUrl: x.image ? buildFileUrl(req, x.image) : "",
        }))
      : [],
  };
};

const getOrCreateFooter = async () => {
  let footer = await FooterSetting.findOne().sort({ createdAt: -1 });

  if (!footer) {
    footer = await FooterSetting.create({});
  }

  return footer;
};

const filesByField = (req) => {
  const map = {};

  if (!Array.isArray(req.files)) return map;

  req.files.forEach((file) => {
    map[file.fieldname] = file;
  });

  return map;
};

/* ======================================================
   GET FOOTER SETTING - ADMIN
   GET /api/footer-settings
====================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const footer = await getOrCreateFooter();

    return successResponse(
      res,
      "Footer setting fetched successfully",
      addImageUrls(req, footer),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   PUBLIC ACTIVE FOOTER SETTING
   GET /api/footer-settings/public/active
====================================================== */
router.get("/public/active", async (req, res) => {
  try {
    const footer = await FooterSetting.findOne({ status: "active" }).sort({
      createdAt: -1,
    });

    return successResponse(
      res,
      "Footer setting fetched successfully",
      footer ? addImageUrls(req, footer) : null,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   UPDATE FULL FOOTER SETTING
   PUT /api/footer-settings
====================================================== */
router.put("/", protectAdmin, upload.any(), async (req, res) => {
  try {
    const footer = await getOrCreateFooter();
    const fileMap = filesByField(req);

    const oldFooterLogo = footer.footerLogo;
    const oldPartnerImage = footer.officialPartnerImage;

    const paymentMethods = normalizeList(
      parseJson(req.body?.paymentMethods, footer.paymentMethods || []),
    );

    const socials = normalizeList(
      parseJson(req.body?.socials, footer.socials || []),
    );

    const sponsors = normalizeList(
      parseJson(req.body?.sponsors, footer.sponsors || []),
    );

    const ambassadors = normalizeList(
      parseJson(req.body?.ambassadors, footer.ambassadors || []),
    );

    const links = normalizeList(parseJson(req.body?.links, footer.links || []));

    paymentMethods.forEach((item, index) => {
      const file = fileMap[`paymentMethods.${index}.image`];

      if (file) {
        if (item.image && !String(item.image).startsWith("http")) {
          deleteLocalFile(item.image);
        }

        item.image = filePath(file);
      }
    });

    sponsors.forEach((item, index) => {
      const file = fileMap[`sponsors.${index}.image`];

      if (file) {
        if (item.image && !String(item.image).startsWith("http")) {
          deleteLocalFile(item.image);
        }

        item.image = filePath(file);
      }

      item.name = normalizeLocalized(item.name);
      item.sub = normalizeLocalized(item.sub);
      item.year = cleanText(item.year);
    });

    ambassadors.forEach((item, index) => {
      const file = fileMap[`ambassadors.${index}.image`];

      if (file) {
        if (item.image && !String(item.image).startsWith("http")) {
          deleteLocalFile(item.image);
        }

        item.image = filePath(file);
      }

      item.name = normalizeLocalized(item.name);
      item.sub = normalizeLocalized(item.sub);
      item.year = cleanText(item.year);
    });

    links.forEach((item) => {
      item.title = normalizeLocalized(item.title);
      item.link = cleanText(item.link);
    });

    socials.forEach((item) => {
      item.label = cleanText(item.label);
      item.iconText = cleanText(item.iconText);
      item.link = cleanText(item.link);
    });

    footer.paymentTitle = normalizeLocalized(
      parseJson(req.body?.paymentTitle, footer.paymentTitle),
    );

    footer.socialTitle = normalizeLocalized(
      parseJson(req.body?.socialTitle, footer.socialTitle),
    );

    footer.sponsorTitle = normalizeLocalized(
      parseJson(req.body?.sponsorTitle, footer.sponsorTitle),
    );

    footer.officialPartnerTitle = normalizeLocalized(
      parseJson(req.body?.officialPartnerTitle, footer.officialPartnerTitle),
    );

    footer.ambassadorTitle = normalizeLocalized(
      parseJson(req.body?.ambassadorTitle, footer.ambassadorTitle),
    );

    footer.descriptionTitle = normalizeLocalized(
      parseJson(req.body?.descriptionTitle, footer.descriptionTitle),
    );

    footer.description = normalizeLocalized(
      parseJson(req.body?.description, footer.description),
    );

    footer.readMoreText = normalizeLocalized(
      parseJson(req.body?.readMoreText, footer.readMoreText),
    );

    footer.showLessText = normalizeLocalized(
      parseJson(req.body?.showLessText, footer.showLessText),
    );

    footer.footerQualityTitle = normalizeLocalized(
      parseJson(req.body?.footerQualityTitle, footer.footerQualityTitle),
    );

    footer.copyrightText = cleanText(
      req.body?.copyrightText || footer.copyrightText,
    );

    footer.officialPartnerLink = cleanText(req.body?.officialPartnerLink);

    colorFields.forEach((field) => {
      if (typeof req.body?.[field] !== "undefined") {
        footer[field] = cleanText(req.body[field]) || footer[field];
      }
    });

    footer.paymentMethods = paymentMethods;
    footer.socials = socials;
    footer.sponsors = sponsors;
    footer.ambassadors = ambassadors;
    footer.links = links;

    footer.status = req.body?.status === "inactive" ? "inactive" : "active";

    if (fileMap.footerLogo) {
      footer.footerLogo = filePath(fileMap.footerLogo);

      if (oldFooterLogo && !String(oldFooterLogo).startsWith("http")) {
        deleteLocalFile(oldFooterLogo);
      }
    }

    if (fileMap.officialPartnerImage) {
      footer.officialPartnerImage = filePath(fileMap.officialPartnerImage);

      if (oldPartnerImage && !String(oldPartnerImage).startsWith("http")) {
        deleteLocalFile(oldPartnerImage);
      }
    }

    if (String(req.body?.removeFooterLogo) === "true") {
      if (footer.footerLogo) deleteLocalFile(footer.footerLogo);
      footer.footerLogo = "";
    }

    if (String(req.body?.removeOfficialPartnerImage) === "true") {
      if (footer.officialPartnerImage) {
        deleteLocalFile(footer.officialPartnerImage);
      }

      footer.officialPartnerImage = "";
    }

    await footer.save();

    return successResponse(
      res,
      "Footer setting updated successfully",
      addImageUrls(req, footer),
    );
  } catch (error) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => deleteLocalFile(file.path));
    }

    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   REMOVE SINGLE FOOTER IMAGE
   PATCH /api/footer-settings/remove-image
====================================================== */
router.patch("/remove-image", protectAdmin, async (req, res) => {
  try {
    const footer = await getOrCreateFooter();

    const type = cleanText(req.body?.type);
    const parentId = cleanText(req.body?.parentId);

    if (type === "footerLogo") {
      deleteLocalFile(footer.footerLogo);
      footer.footerLogo = "";
    } else if (type === "officialPartnerImage") {
      deleteLocalFile(footer.officialPartnerImage);
      footer.officialPartnerImage = "";
    } else if (type === "paymentMethod") {
      const item = footer.paymentMethods.id(parentId);

      if (!item) return errorResponse(res, "Payment method not found", 404);

      deleteLocalFile(item.image);
      item.image = "";
    } else if (type === "sponsor") {
      const item = footer.sponsors.id(parentId);

      if (!item) return errorResponse(res, "Sponsor not found", 404);

      deleteLocalFile(item.image);
      item.image = "";
    } else if (type === "ambassador") {
      const item = footer.ambassadors.id(parentId);

      if (!item) return errorResponse(res, "Ambassador not found", 404);

      deleteLocalFile(item.image);
      item.image = "";
    } else {
      return errorResponse(res, "Invalid image type", 400);
    }

    await footer.save();

    return successResponse(
      res,
      "Footer image removed successfully",
      addImageUrls(req, footer),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   RESET FOOTER COLORS ONLY
   PATCH /api/footer-settings/reset-colors
====================================================== */
router.patch("/reset-colors", protectAdmin, async (req, res) => {
  try {
    const footer = await getOrCreateFooter();

    footer.footerBg = "#ffffff";
    footer.footerText = "#111111";
    footer.sectionTitleText = "#111111";
    footer.dividerBg = "#d6d6d6";

    footer.socialIconBg = "#0b66a8";
    footer.socialIconText = "#ffffff";

    footer.linkBorder = "#0b66a8";
    footer.linkText = "#005daa";

    footer.descriptionTitleText = "#444444";
    footer.descriptionText = "#999999";

    footer.readMoreButtonBg = "#006bb6";
    footer.readMoreButtonText = "#ffffff";

    footer.qualityTitleText = "#005daa";
    footer.copyrightTextColor = "#888888";

    footer.itemTitleText = "#111111";
    footer.itemSubText = "#111111";

    await footer.save();

    return successResponse(
      res,
      "Footer colors reset successfully",
      addImageUrls(req, footer),
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE FOOTER SETTING
   DELETE /api/footer-settings/:id
====================================================== */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, "Invalid footer setting id", 400);
    }

    const footer = await FooterSetting.findByIdAndDelete(req.params.id);

    if (!footer) {
      return errorResponse(res, "Footer setting not found", 404);
    }

    if (footer.footerLogo) deleteLocalFile(footer.footerLogo);
    if (footer.officialPartnerImage)
      deleteLocalFile(footer.officialPartnerImage);

    footer.paymentMethods?.forEach((item) => deleteLocalFile(item.image));
    footer.sponsors?.forEach((item) => deleteLocalFile(item.image));
    footer.ambassadors?.forEach((item) => deleteLocalFile(item.image));

    return successResponse(res, "Footer setting deleted successfully", footer);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
