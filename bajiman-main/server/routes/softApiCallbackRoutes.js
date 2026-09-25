import express from "express";
import SoftApiCallbackEvent from "../models/SoftApiCallbackEvent.js";
import { parseSoftApiCallback } from "../services/softApiCallback.js";
import { resolveSoftApiSecret } from "../services/softApiCrypto.js";

const router = express.Router();

router.post("/callback", async (req, res) => {
  let event;
  try {
    const encryptionMode = String(
      process.env.SOFTAPI_CALLBACK_ENCRYPTION_MODE || "required",
    ).trim().toLowerCase();
    event = parseSoftApiCallback(req.body, {
      secret: resolveSoftApiSecret(),
      encryptionMode,
    });
  } catch (error) {
    console.warn("SoftAPI callback rejected:", String(error?.message || "invalid callback").slice(0, 160));
    return res.status(400).json({ code: 1, msg: "Invalid SoftAPI callback" });
  }

  try {
    let duplicate = false;
    try {
      const result = await SoftApiCallbackEvent.updateOne(
        { eventKey: event.eventKey },
        { $setOnInsert: event },
        { upsert: true },
      );
      duplicate = Number(result.upsertedCount || 0) === 0;
    } catch (error) {
      if (error?.code !== 11000) throw error;
      duplicate = true;
    }
    return res.status(200).json({
      code: 0,
      msg: "OK",
      notify_only: true,
      duplicate,
    });
  } catch (error) {
    console.error("SoftAPI callback persistence failed:", String(error?.message || "database unavailable").slice(0, 160));
    return res.status(503).json({ code: 1, msg: "Callback storage temporarily unavailable" });
  }
});

export default router;
