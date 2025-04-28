const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const JadwalProduksiLembur = db.define(
  "jadwal_produksi_lembur",
  {
    tanggal_lembur: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    shift_1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    shift_2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = JadwalProduksiLembur;
