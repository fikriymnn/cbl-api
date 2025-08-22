const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterBrand = db.define(
  "ms_brand",
  {
    kode_brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterBrand;
