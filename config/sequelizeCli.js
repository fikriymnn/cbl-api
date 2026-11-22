// konfigurasi koneksi untuk sequelize-cli (npm run migrate)
// memakai .env yang sama dengan config/database.js
require("dotenv").config();

const base = {
  username: process.env.DB_ROOT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: "mysql",
  dialectOptions: { charset: "utf8mb4" },
  define: { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" },
  // tabel pencatat migration yang sudah dijalankan
  migrationStorageTableName: "SequelizeMeta",
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
