import fs from "fs";
import path from "path";
import Kyc from "../models/Kyc.js";
import User from "../models/User.js";
import { z } from "zod";

const KycValidator = z.object({
  nurseryName: z.string().min(3, "Nursery name must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  dob: z.string().min(1, "Established date is required"),
  lat: z.preprocess((val) => Number(val), z.number({ invalid_type_error: "Invalid latitude" })),
  lng: z.preprocess((val) => Number(val), z.number({ invalid_type_error: "Invalid longitude" })),
  addressName: z.string().optional()
});

const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch {}
  }
};

// Move file from temp to final destination folder
const moveFile = (file, destDir) => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
  const destPath = path.join(destDir, fileName);
  fs.renameSync(file.path, destPath);
  // Return clean forward-slash path
  return destPath.replace(/\\/g, "/");
};

export const submitKyc = async (req, res) => {
  const logoFile = req.files?.image?.[0];
  const docFile = req.files?.documentImage?.[0];

  try {
    const validation = KycValidator.safeParse(req.body);
    if (!validation.success) {
      // Clean up temp files on validation error
      if (logoFile) deleteFile(logoFile.path);
      if (docFile) deleteFile(docFile.path);
      return res.status(400).json({ message: validation.error.errors[0].message });
    }

    if (!logoFile || !docFile) {
      return res.status(400).json({ message: "Both logo and registration document are required" });
    }

    const userId = req.user.id;

    // Move from temp to uploads/kyc/{userId}/
    const destDir = path.join("uploads", "kyc", String(userId));
    const logoPath = moveFile(logoFile, destDir);
    const docPath = moveFile(docFile, destDir);

    const [kyc, created] = await Kyc.findOrCreate({
      where: { userId },
      defaults: {
        ...validation.data,
        userId,
        image: logoPath,
        documentImage: docPath,
        status: "pending"
      }
    });

    if (!created) {
      // Delete old files from disk when resubmitting
      deleteFile(kyc.image);
      deleteFile(kyc.documentImage);
      await kyc.update({
        ...validation.data,
        image: logoPath,
        documentImage: docPath,
        status: "pending"
      });
    }

    await User.update({ kycStatus: "pending" }, { where: { id: userId } });
    res.status(201).json({ message: "KYC submitted successfully", status: "pending" });

  } catch (error) {
    // Clean up temp files on any error
    if (logoFile) deleteFile(logoFile.path);
    if (docFile) deleteFile(docFile.path);
    console.error("KYC Submission Error:", error);
    res.status(500).json({ message: "Server error during KYC submission" });
  }
};

// ─── UPDATE NURSERY LOGO ONLY ─────────────────────────────────────────────────
export const updateLogo = async (req, res) => {
  const logoFile = req.file;
  try {
    if (!logoFile) return res.status(400).json({ message: "No image provided" });

    const kyc = await Kyc.findOne({ where: { userId: req.user.id } });
    if (!kyc) { deleteFile(logoFile.path); return res.status(404).json({ message: "KYC not found" }); }

    // Delete old logo from disk
    deleteFile(kyc.image);

    const destDir = path.join("uploads", "kyc", String(req.user.id));
    const logoPath = moveFile(logoFile, destDir);

    await kyc.update({ image: logoPath });
    res.json({ image: logoPath });
  } catch (error) {
    if (logoFile) deleteFile(logoFile.path);
    res.status(500).json({ message: "Failed to update logo" });
  }
};

export const getKycStatus = async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ where: { userId: req.user.id } });
    if (!kyc) return res.json({ status: "none" });
    res.json({ status: kyc.status, kyc });
  } catch (error) {
    res.status(500).json({ message: "Error fetching status" });
  }
};