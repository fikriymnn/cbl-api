const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterTerlambat = db.define(
  "ms_terlambat",
  {
    alasan_terlambat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_jam: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  },
);

module.exports = MasterTerlambat;
