import Plant from "../models/Plant.js";
import User from "../models/User.js";
import Kyc from "../models/Kyc.js";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch {}
  }
};

const moveFile = (file, destDir) => {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
  const destPath = path.join(destDir, fileName);
  fs.renameSync(file.path, destPath);
  return destPath.replace(/\\/g, "/");
};

export const getAllPlants = async (req, res) => {
  try {
    const { category, environment, seasonality, excludeUserId, nurseryId } = req.query;
    const where = {};
    if (category) where.category = category;
    if (environment) where.environment = environment;
    if (seasonality) where.seasonality = seasonality;
    if (excludeUserId) where.userId = { [Op.ne]: parseInt(excludeUserId) };
    if (nurseryId) where.userId = parseInt(nurseryId);

    const plants = await Plant.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "fullName"],
          include: [{ model: Kyc, attributes: ["nurseryName", "image"], required: false }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching marketplace" });
  }
};

export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "fullName"],
          include: [{ model: Kyc, attributes: ["nurseryName", "image"], required: false }]
        }
      ]
    });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plant" });
  }
};

export const getMyPlants = async (req, res) => {
  try {
    const plants = await Plant.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your inventory" });
  }
};

export const getAllNurseries = async (req, res) => {
  try {
    const nurseries = await Kyc.findAll({
      where: { status: "verified" },
      include: [{ model: User, attributes: ["id", "fullName"] }],
      attributes: ["nurseryName", "image", "userId", "addressName"]
    });
    res.json(nurseries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nurseries" });
  }
};

export const addPlant = async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "verified") {
      if (req.file) deleteFile(req.file.path);
      return res.status(403).json({
        message: kyc ? "Your KYC is still pending verification" : "Please complete KYC verification first"
      });
    }

    await User.update({ kycStatus: "verified" }, { where: { id: req.user.id } });

    const { name, price, quantity, category, environment, seasonality, guide } = req.body;
    if (!req.file) return res.status(400).json({ message: "Plant image is required" });
    if (!name || !price || !guide || !category || !environment || !seasonality) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ message: "All fields are required" });
    }

    const imagePath = moveFile(req.file, "uploads/plants");

    const newPlant = await Plant.create({
      name, price: parseFloat(price), quantity: parseInt(quantity) || 1,
      category, environment, seasonality, guide, image: imagePath, userId: req.user.id
    });

    res.status(201).json(newPlant);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// ─── UPDATE PLANT ─────────────────────────────────────────────────────────────
export const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.userId !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const { name, price, quantity, category, environment, seasonality, guide } = req.body;

    // If a new image was uploaded, replace the old one
    let imagePath = plant.image;
    if (req.file) {
      deleteFile(plant.image); // delete old image from disk
      imagePath = moveFile(req.file, "uploads/plants");
    }

    await plant.update({
      name: name || plant.name,
      price: price ? parseFloat(price) : plant.price,
      quantity: quantity !== undefined ? parseInt(quantity) : plant.quantity,
      category: category || plant.category,
      environment: environment || plant.environment,
      seasonality: seasonality || plant.seasonality,
      guide: guide || plant.guide,
      image: imagePath,
    });

    res.json(plant);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({ message: "Failed to update plant" });
  }
};

export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.userId !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    deleteFile(plant.image);
    await plant.destroy();
    res.json({ message: "Plant removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};