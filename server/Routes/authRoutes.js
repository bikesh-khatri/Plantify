import express from "express";
import { registerUser, loginUser, verifyToken, getProfile, updateProfile, changePassword, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-token", protect, verifyToken);
router.get("/profile", protect, getProfile);
router.patch("/update-profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

export default router;