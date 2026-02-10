import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { connection, sequelize } from "./database/database.js";
import authRoutes from "./Routes/authRoutes.js";
import kycRoutes from "./Routes/kycRoutes.js";
import plantRoutes from "./Routes/plantRoutes.js";
import bookingRoutes from "./Routes/bookingRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5001;

connection()
  .then(async () => {
    try {
      await sequelize.sync({ alter: true });
      console.log("Database Connected & Synced Successfully!");
      app.listen(PORT, () => {
        console.log(`Plantify Server running on: http://localhost:${PORT}`);
      });
    } catch (syncError) {
      console.error("Sync Error:", syncError);
    }
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });