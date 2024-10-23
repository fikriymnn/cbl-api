const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const db = new Sequelize(
  process.env.DB_NAME_FINGER,
  process.env.DB_ROOT_FINGER,
  process.env.DB_PASS_FINGER,
  {
    host: process.env.DB_HOST_FINGER,
    dialect: "mysql",
    dialectModule: require("mysql2"),

    //logging: false,
  }
);

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully. to FINGERPRINT");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

module.exports = db;
