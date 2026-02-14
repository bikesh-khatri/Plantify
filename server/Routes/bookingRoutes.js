import express from "express";
import { protect } from "../middleware/auth.js";
import {
  bookPlant,
  updateBookingStatus,
  getMyNurseryBookings,
  getMyBookings
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/book", protect, bookPlant);
router.patch("/status/:bookingId", protect, updateBookingStatus);
router.get("/nursery-requests", protect, getMyNurseryBookings);
router.get("/my-bookings", protect, getMyBookings); // REQ 11

export default router;