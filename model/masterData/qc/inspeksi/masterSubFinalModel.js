const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const User = require("../../../userModel");

const InspeksiMasterSubFinal = db.define(
  "cs_master_inspeksi_final_sub",
  {
    quantity_awal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_akhir: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kualitas_lulus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kualitas_tolak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiMasterSubFinal;
