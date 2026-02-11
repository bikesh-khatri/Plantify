import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import User from "./User.js";

const Kyc = sequelize.define("Kyc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nurseryName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATEONLY, allowNull: false },
  lat: { type: DataTypes.DOUBLE, allowNull: false },
  lng: { type: DataTypes.DOUBLE, allowNull: false },
  addressName: { type: DataTypes.TEXT, allowNull: true }, // REQ 8: geocoded address
  documentImage: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "verified", "rejected"),
    defaultValue: "pending"
  }
});

User.hasOne(Kyc, { foreignKey: "userId", onDelete: "CASCADE" });
Kyc.belongsTo(User, { foreignKey: "userId" });

export default Kyc;