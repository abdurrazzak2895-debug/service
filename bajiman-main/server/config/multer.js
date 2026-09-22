// config/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ ensure uploads folder exists
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ allowed mime types
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg", // jpg, jpeg
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

// ✅ allowed extensions (fallback)
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  const extOk = ALLOWED_EXT.has(ext);

  if (mimeOk && extOk) return cb(null, true);

  cb(
    new Error(
      "Only image files are allowed (png, jpg, jpeg, webp, svg, avif, gif).",
    ),
    false,
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // ✅ 100MB (change if you want)
  },
});

export default upload;
