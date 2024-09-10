const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Department = require("../department/masterDepartmentModel");
const User = require("../../../userModel");

const InspeksiMasterCetakPeriodeDefect = db.define(
  "cs_master_inspeksi_cetak_periode_defect",
  {
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sumber_masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kriteria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    persen_kriteria: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiMasterCetakPeriodeDefect;
