const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMesin = require("../masterMesinModel");

const { DataTypes } = Sequelize;

const MasterKategoriSettingKapasitas = db.define(
  "ms_setting_kapasitas",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    setting_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    setting_b: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    setting_c: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kapasitas_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kapasitas_b: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kapasitas_c: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterKategoriSettingKapasitas;
