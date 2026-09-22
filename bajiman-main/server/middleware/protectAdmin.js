import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    console.log("AUTH HEADER:", auth);

    const token = auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : null;

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - no token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - admin not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized - invalid token",
    });
  }
};



export const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return res.status(403).json({
      success: false,
      message: "Only mother admin allowed",
    });
  }

  next();
};