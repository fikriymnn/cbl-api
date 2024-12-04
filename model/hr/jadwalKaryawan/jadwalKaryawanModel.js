const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const JadwalKaryawan = db.define(
  "jadwal_karyawan",
  {
    jenis_karyawan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "produksi",
    },
    nama_jadwal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = JadwalKaryawan;
