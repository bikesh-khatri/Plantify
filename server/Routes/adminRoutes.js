import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  getKycs,
  updateKycStatus,
  getAllPlantsAdmin,
  getPlantDetailAdmin,
  adminDeletePlant,
  getAllBookingsAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, requireAdmin, getDashboardStats);

router.get("/users", protect, requireAdmin, getAllUsers);
router.get("/user/:id", protect, requireAdmin, getUserDetail);
router.patch("/user-status/:id", protect, requireAdmin, updateUserStatus);

router.post("/kycs", protect, requireAdmin, getKycs);
router.patch("/kyc-status/:id", protect, requireAdmin, updateKycStatus);

router.post("/plants", protect, requireAdmin, getAllPlantsAdmin);
router.get("/plant/:id", protect, requireAdmin, getPlantDetailAdmin);
router.delete("/plant/:id", protect, requireAdmin, adminDeletePlant);

router.post("/bookings", protect, requireAdmin, getAllBookingsAdmin);

export default router;