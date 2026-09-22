import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectUser = async (req, res, next) => {
  try {
    const header =
      req.headers.authorization || "";

    const token = header.startsWith(
      "Bearer "
    )
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default protectUser;