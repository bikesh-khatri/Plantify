import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import User from "./User.js";
import Plant from "./Plant.js";

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
});

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });
Plant.hasMany(Booking, { foreignKey: "plantId" });
Booking.belongsTo(Plant, { foreignKey: "plantId" });

export default Booking;