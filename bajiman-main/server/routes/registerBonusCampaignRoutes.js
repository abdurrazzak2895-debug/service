import express from "express";
import RegisterBonusCampaign from "../models/RegisterBonusCampaign.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

const normalizeEligibleProviders = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      providerCode: cleanText(item?.providerCode).toUpperCase(),
      percent: Math.min(100, Math.max(0, Number(item?.percent ?? 100))),
    }))
    .filter((item) => item.providerCode);
};

const sumPercent = (list) =>
  (Array.isArray(list) ? list : []).reduce(
    (sum, item) => sum + Number(item?.percent || 0),
    0,
  );

// A campaign whose endDate has passed is treated as closed even before
// anyone explicitly closes it — checked lazily wherever the active
// campaign is read, rather than via a cron job.
const closeIfExpired = async (campaign) => {
  if (!campaign || campaign.status !== "active") return campaign;
  if (campaign.endDate && new Date(campaign.endDate) > new Date()) {
    return campaign;
  }

  return RegisterBonusCampaign.findByIdAndUpdate(
    campaign._id,
    { status: "closed", closedAt: new Date(), closedReason: "expired" },
    { returnDocument: "after" },
  );
};

// Used by userRoutes.js at registration time — returns the currently
// active, not-yet-expired campaign, or null if none.
export const getActiveRegisterBonusCampaign = async () => {
  const campaign = await RegisterBonusCampaign.findOne({ status: "active" });
  const resolved = await closeIfExpired(campaign);

  return resolved?.status === "active" ? resolved : null;
};

/* ADMIN: list all campaigns */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const activeCampaign = await RegisterBonusCampaign.findOne({
      status: "active",
    });
    await closeIfExpired(activeCampaign);

    const campaigns = await RegisterBonusCampaign.find()
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Register bonus campaigns loaded", campaigns);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: create campaign */
router.post("/", protectAdmin, async (req, res) => {
  try {
    const body = req.body || {};

    const titleBn = cleanText(body?.title?.bn);
    const titleEn = cleanText(body?.title?.en);
    const bonusAmount = Number(body.bonusAmount);
    const turnoverMultiplier = Math.max(0, Number(body.turnoverMultiplier ?? 1));
    const endDate = body.endDate ? new Date(body.endDate) : null;
    const eligibleProviders = normalizeEligibleProviders(body.eligibleProviders);

    if (!titleBn || !titleEn) {
      return errorResponse(res, "Title (Bangla + English) is required", 400);
    }

    if (!Number.isFinite(bonusAmount) || bonusAmount <= 0) {
      return errorResponse(res, "A valid bonus amount is required", 400);
    }

    if (!endDate || Number.isNaN(endDate.getTime())) {
      return errorResponse(res, "A valid end date is required", 400);
    }

    if (endDate <= new Date()) {
      return errorResponse(res, "End date must be in the future", 400);
    }

    if (sumPercent(eligibleProviders) > 100) {
      return errorResponse(
        res,
        "Eligible providers' percent adds up to more than 100%",
        400,
      );
    }

    const existingActive = await getActiveRegisterBonusCampaign();

    if (existingActive) {
      return errorResponse(
        res,
        `An active campaign ("${existingActive.title.en}") is already running — close it first before starting a new one.`,
        409,
      );
    }

    const campaign = await RegisterBonusCampaign.create({
      title: { bn: titleBn, en: titleEn },
      bonusAmount,
      turnoverMultiplier,
      eligibleProviders,
      endDate,
      status: "active",
    });

    return successResponse(
      res,
      "Register bonus campaign created",
      campaign,
      201,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: update campaign (content only — status changes go through /close) */
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const campaign = await RegisterBonusCampaign.findById(req.params.id);

    if (!campaign) {
      return errorResponse(res, "Campaign not found", 404);
    }

    const body = req.body || {};

    const titleBn = cleanText(body?.title?.bn);
    const titleEn = cleanText(body?.title?.en);
    const bonusAmount = Number(body.bonusAmount);
    const turnoverMultiplier = Math.max(0, Number(body.turnoverMultiplier ?? 1));
    const endDate = body.endDate ? new Date(body.endDate) : null;
    const eligibleProviders = normalizeEligibleProviders(body.eligibleProviders);

    if (!titleBn || !titleEn) {
      return errorResponse(res, "Title (Bangla + English) is required", 400);
    }

    if (!Number.isFinite(bonusAmount) || bonusAmount <= 0) {
      return errorResponse(res, "A valid bonus amount is required", 400);
    }

    if (!endDate || Number.isNaN(endDate.getTime())) {
      return errorResponse(res, "A valid end date is required", 400);
    }

    if (sumPercent(eligibleProviders) > 100) {
      return errorResponse(
        res,
        "Eligible providers' percent adds up to more than 100%",
        400,
      );
    }

    campaign.title = { bn: titleBn, en: titleEn };
    campaign.bonusAmount = bonusAmount;
    campaign.turnoverMultiplier = turnoverMultiplier;
    campaign.eligibleProviders = eligibleProviders;
    campaign.endDate = endDate;

    await campaign.save();

    const resolved = await closeIfExpired(campaign);

    return successResponse(res, "Register bonus campaign updated", resolved);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: close a campaign early */
router.post("/:id/close", protectAdmin, async (req, res) => {
  try {
    const campaign = await RegisterBonusCampaign.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { status: "closed", closedAt: new Date(), closedReason: "manual" },
      { returnDocument: "after" },
    );

    if (!campaign) {
      return errorResponse(res, "Active campaign not found", 404);
    }

    return successResponse(res, "Register bonus campaign closed", campaign);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: delete campaign */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const deleted = await RegisterBonusCampaign.findByIdAndDelete(
      req.params.id,
    );

    if (!deleted) {
      return errorResponse(res, "Campaign not found", 404);
    }

    return successResponse(res, "Register bonus campaign deleted", deleted);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
