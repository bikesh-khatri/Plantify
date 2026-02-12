import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, please login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "plantify_secret_key_123");
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    return next();
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Token failed" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};