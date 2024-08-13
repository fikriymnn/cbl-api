const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const User = require("../../../userModel");

const InspeksiMasterLemPeriodeDefect = db.define(
  "cs_master_inspeksi_lem_periode_defect",
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
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiMasterLemPeriodeDefect;
