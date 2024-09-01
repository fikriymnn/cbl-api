const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiCoatingPointMasterPeriode = db.define(
  "cs_master_inspeksi_coating_periode_defect",
  { 
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING, 
      allowNull: true,
      defaultValue: "active",
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
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiCoatingPointMasterPeriode;