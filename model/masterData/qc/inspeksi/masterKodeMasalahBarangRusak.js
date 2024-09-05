const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const User = require("../../../userModel");

const InspeksiMasterBarangRusakSebagian = db.define(
  "cs_master_inspeksi_barang_rusak_sebagian",
  {
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    asal_temuan: {
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

module.exports = InspeksiMasterBarangRusakSebagian;
