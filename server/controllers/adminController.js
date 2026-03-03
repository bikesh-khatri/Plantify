import User from "../models/User.js";
import Kyc from "../models/Kyc.js";
import Plant from "../models/Plant.js";
import Booking from "../models/Booking.js";
import { Op } from "sequelize";
import { sequelize } from "../database/database.js";

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPlants, totalBookings, pendingKycs, acceptedBookings] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: "admin" } } }),
      Plant.count(),
      Booking.count(),
      Kyc.count({ where: { status: "pending" } }),
      Booking.count({ where: { status: "accepted" } }),
    ]);

    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["fullName"] },
        { model: Plant, attributes: ["name", "price"] }
      ]
    });

    res.json({ totalUsers, totalPlants, totalBookings, pendingKycs, acceptedBookings, recentBookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: "admin" } },
      attributes: ["id", "fullName", "email", "phone", "kycStatus", "status", "createdAt"],
      include: [{ model: Kyc, attributes: ["nurseryName", "image", "status", "addressName"] }],
      order: [["createdAt", "DESC"]]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Kyc }]
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const [totalBookings, acceptedBookings, totalPlants] = await Promise.all([
      Booking.count({ where: { userId: user.id } }),
      Booking.count({ where: { userId: user.id, status: "accepted" } }),
      Plant.count({ where: { userId: user.id } })
    ]);

    res.json({ ...user.toJSON(), stats: { totalBookings, acceptedBookings, totalPlants } });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.update({ status: req.body.status });
    res.json({ message: `User ${req.body.status}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

export const getKycs = async (req, res) => {
  try {
    const { status } = req.body;
    const kycs = await Kyc.findAll({
      where: status ? { status } : {},
      include: [{ model: User, attributes: ["id", "fullName", "email", "phone", "status"] }],
      order: [["updatedAt", "DESC"]]
    });
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching KYC list" });
  }
};

export const updateKycStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status, remarks } = req.body;
    const kyc = await Kyc.findByPk(req.params.id);
    if (!kyc) { await t.rollback(); return res.status(404).json({ message: "KYC not found" }); }

    await kyc.update({ status, remarks }, { transaction: t });
    await User.update({ kycStatus: status }, { where: { id: kyc.userId }, transaction: t });

    await t.commit();
    res.json({ message: `KYC ${status}` });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "Error updating KYC" });
  }
};

// ─── PLANTS ───────────────────────────────────────────────────────────────────

export const getAllPlantsAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    let where = {};
    if (status === "out_of_stock") where.quantity = 0;
    if (status === "active") where.quantity = { [Op.gt]: 0 };

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
  } catch (err) {
    res.status(500).json({ message: "Error fetching plants" });
  }
};

export const getPlantDetailAdmin = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "email"],
          include: [{ model: Kyc, attributes: ["nurseryName", "image", "addressName"], required: false }]
        }
      ]
    });
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    const [bookingCount, acceptedCount] = await Promise.all([
      Booking.count({ where: { plantId: plant.id } }),
      Booking.count({ where: { plantId: plant.id, status: "accepted" } })
    ]);

    res.json({ ...plant.toJSON(), bookingCount, acceptedCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching plant" });
  }
};

export const adminDeletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    await plant.destroy();
    res.json({ message: "Plant removed by admin" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting plant" });
  }
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export const getAllBookingsAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const where = {};
    if (status && status !== "all") where.status = status;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, attributes: ["id", "fullName", "email", "phone"] },
        { model: Plant, attributes: ["id", "name", "price", "image"] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};