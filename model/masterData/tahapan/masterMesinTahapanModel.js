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
