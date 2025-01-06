const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterDivisi = db.define(
  "ms_status_karyawan",
  {
    nama_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    waktu_bulan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterDivisi;
