const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterMesin = db.define(
  "ms_mesin_tahapan",
  {
    kode_mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type_kapasitas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // true = mesin boleh dipakai beberapa JO di jam yang sama (tidak dicek bentrok)
    allow_concurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

module.exports = MasterMesin;
