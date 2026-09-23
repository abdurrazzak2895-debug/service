import express from "express";
import { protectAdmin } from "../middleware/protectAdmin.js";
import syncOracleCatalog from "../services/oracleCatalogSync.js";

const router = express.Router();

// POST /api/admin/oracle-sync
// Body: { categoryId, providerCodes?: [], dryRun?: boolean, concurrency?: number }
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { categoryId, providerCodes = [], dryRun = false, concurrency = 3 } = req.body || {};
    const result = await syncOracleCatalog({
      categoryId,
      providerCodes: Array.isArray(providerCodes) ? providerCodes : [],
      dryRun: dryRun === true || dryRun === "true",
      concurrency,
    });
    return res.status(200).json({
      success: result.providerErrors.length === 0,
      message: result.providerErrors.length
        ? "Oracle synchronization completed with provider errors"
        : result.dryRun
          ? "Oracle synchronization dry-run completed"
          : "Oracle synchronization completed",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Oracle synchronization failed",
    });
  }
});

export default router;
