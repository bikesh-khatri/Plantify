import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Kyc from "../models/Kyc.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, dob } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName, email, phone, dob,
      password: hashedPassword,
      kycStatus: "none"
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || "plantify_secret_key_123",
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id, fullName: newUser.fullName, email: newUser.email,
        phone: newUser.phone, dob: newUser.dob, kycStatus: "none", role: newUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const expiresIn = rememberMe ? "7d" : "1h";
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "plantify_secret_key_123", { expiresIn });
    res.json({
      message: "Login success", token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, dob: user.dob, kycStatus: user.kycStatus, role: user.role }
    });
  } catch {
    res.status(500).json({ message: "Login Error" });
  }
};

export const verifyToken = (req, res) => {
  if (!req.user) return res.status(401).json({ valid: false, message: "User not found" });
  res.status(200).json({ valid: true, user: req.user });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ message: "User not found" });
    let kyc = null;
    if (user.kycStatus !== "none") {
      kyc = await Kyc.findOne({ where: { userId: req.user.id } });
    }
    res.json({ ...user.toJSON(), kyc });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile: " + error.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check phone uniqueness if changed
    if (phone && phone !== user.phone) {
      const existing = await User.findOne({ where: { phone } });
      if (existing) return res.status(409).json({ message: "Phone number already in use" });
    }

    await user.update({ fullName, phone });
    res.json({ message: "Profile updated", user: { fullName: user.fullName, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ message: "Update failed: " + error.message });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    await user.destroy();
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};