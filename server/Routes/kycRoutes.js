import express from "express";
import { submitKyc, getKycStatus, updateLogo } from "../controllers/kycController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploads.js";

const router = express.Router();

router.post("/submit", protect, upload.fields([{ name: "image", maxCount: 1 }, { name: "documentImage", maxCount: 1 }]), submitKyc);
router.get("/status", protect, getKycStatus);
router.patch("/update-logo", protect, upload.single("image"), updateLogo);

export default router;