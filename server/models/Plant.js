import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import User from "./User.js";

const Plant = sequelize.define("Plant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // TEMPORARY FIX: Sabai lai true banayeko chhu sync error bypass garna
  category: {
    type: DataTypes.ENUM("flowering", "non-flowering"),
    allowNull: false, 
  },
  environment: {
    type: DataTypes.ENUM("indoor", "outdoor"),
    allowNull: false,
  },
  seasonality: {
    type: DataTypes.ENUM("seasonal", "perennial"),
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  guide: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

User.hasMany(Plant, { foreignKey: "userId", onDelete: "CASCADE" });
Plant.belongsTo(User, { foreignKey: "userId" });

export default Plant;