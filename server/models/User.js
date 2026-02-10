import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
  // THAPEKO FIELD:
  kycStatus: {
    type: DataTypes.ENUM("none", "pending", "verified", "rejected"),
    defaultValue: "none",
  }
});

export default User;