import express from "express";
import {
  getAllPlants,
  getPlantById,
  addPlant,
  updatePlant,
  getMyPlants,
  deletePlant,
  getAllNurseries
} from "../controllers/plantController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploads.js";

const router = express.Router();

router.get("/all", getAllPlants);
router.get("/nurseries", getAllNurseries);
router.get("/my-plants", protect, getMyPlants);
router.get("/:id", getPlantById);
router.post("/add", protect, upload.single("image"), addPlant);
router.patch("/:id", protect, upload.single("image"), updatePlant);
router.delete("/:id", protect, deletePlant);

export default router;