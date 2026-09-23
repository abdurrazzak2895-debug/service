import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { launchNineWicket } from "./nineWicketRoutes.js";

const router = express.Router();

// Kept for legacy clients that still send this route's old auth shape.
// All actual game launches now use the shared 9Wicket wallet/session handler.
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded?.id || decoded?._id || decoded?.userId || decoded?.user?._id || decoded?.user?.id;
    if (!id) return res.status(401).json({ success: false, message: "Invalid token payload" });

    const user = await User.findById(id).select("_id role");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    req.user = { id: user._id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Existing client endpoints retained, but Oracle is no longer used.
router.post("/playgame", requireAuth, launchNineWicket);
router.post("/launch", protectUser, launchNineWicket);

export default router;
