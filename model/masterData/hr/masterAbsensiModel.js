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
    terhitung_lembur_menit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    outstanding_karyawan_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minimal_pengajuan_cuti_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    maksimal_pengajuan_terlambat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  },
);

module.exports = MasterAbsensi;
