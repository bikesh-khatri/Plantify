import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";


console.log("DB_NAME =", process.env.DB_NAME);

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
  }
);

export const connection = async () => {
  try {
    await sequelize.authenticate();
  
    await sequelize.sync({ alter: true });
    console.log("Database Connected Successfully");
  } catch (e) {
    console.error("DB Error:", e.message);
  }
};