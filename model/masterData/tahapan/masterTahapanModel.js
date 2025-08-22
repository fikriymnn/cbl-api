const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterTahapan = db.define(
  "ms_tahapan",
  {
    kode_tahapan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_tahapan: {
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

module.exports = MasterTahapan;
