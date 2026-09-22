// routes/downloadHeaderRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import DownloadHeader from "../models/DownloadHeader.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// image ext + apk ext
const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
  ".ico",
]);
const APK_EXT = new Set([".apk"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = IMAGE_EXT.has(ext) || APK_EXT.has(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  // icon image
  if (file.fieldname === "icon") {
    const ok = IMAGE_EXT.has(ext) || mime.startsWith("image/");
    if (ok) return cb(null, true);
    return cb(new Error("Icon must be an image file."), false);
  }

  // apk file
  if (file.fieldname === "apk") {
    // apk mime sometimes unreliable -> ext is safest
    const ok =
      APK_EXT.has(ext) ||
      mime.includes("android") ||
      mime.includes("octet-stream");
    if (ok) return cb(null, true);
    return cb(new Error("APK file must be .apk"), false);
  }

  return cb(new Error("Invalid upload field."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (apk বড় হলে বাড়াও)
});

const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    if (!fileUrl.startsWith("/uploads/")) return;
    const filePath = path.join(
      process.cwd(),
      fileUrl.replace("/uploads/", "uploads/"),
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
};

/**
 * GET /api/download-header
 */
router.get("/download-header", async (req, res) => {
  try {
    let data = await DownloadHeader.findOne();

    if (!data) {
      data = new DownloadHeader(DownloadHeader.getDefault());
      await data.save();
    }

    res.json(data);
  } catch (err) {
    console.error("DownloadHeader GET error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching download header" });
  }
});

/**
 * PUT /api/download-header
 * - multipart/form-data
 * - fields: appNameBn, appNameEn, titleBn, titleEn, btnTextBn, btnTextEn, isActive
 * - files: icon, apk
 */
router.put(
  "/download-header",
  protectAdmin,
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "apk", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};

      let data = await DownloadHeader.findOne();
      if (!data) data = new DownloadHeader(DownloadHeader.getDefault());

      // strings
      if (typeof body.appNameBn === "string") data.appNameBn = body.appNameBn;
      if (typeof body.appNameEn === "string") data.appNameEn = body.appNameEn;

      if (typeof body.titleBn === "string") data.titleBn = body.titleBn;
      if (typeof body.titleEn === "string") data.titleEn = body.titleEn;

      if (typeof body.btnTextBn === "string") data.btnTextBn = body.btnTextBn;
      if (typeof body.btnTextEn === "string") data.btnTextEn = body.btnTextEn;

      if (typeof body.isActive === "string")
        data.isActive = body.isActive === "true";

      // files
      const icon = req.files?.icon?.[0];
      const apk = req.files?.apk?.[0];

      if (icon) {
        deleteIfExists(data.iconUrl);
        data.iconUrl = `/${UPLOAD_DIR}/${icon.filename}`;
      }

      if (apk) {
        deleteIfExists(data.apkUrl);
        data.apkUrl = `/${UPLOAD_DIR}/${apk.filename}`;
      }

      await data.save();
      res.json({ message: "Download header updated successfully", data });
    } catch (err) {
      console.error("DownloadHeader PUT error:", err);
      res.status(500).json({
        error: err?.message || "Server error while updating download header",
      });
    }
  },
);

// multer error handler
router.use((err, req, res, next) => {
  return res.status(400).json({ error: err?.message || "Upload error" });
});

export default router;
