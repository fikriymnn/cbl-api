import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(process.env.DB_NAME, "root", "", {
  host: process.env.DB_HOST,
  dialect: "mysql",
});

export default db;
