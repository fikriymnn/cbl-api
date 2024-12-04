const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterAbsensi = db.define(
  "ms_absensi",
  {
    toleransi_kedatangan_menit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toleransi_pulang_menit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterAbsensi;
