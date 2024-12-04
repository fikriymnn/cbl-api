const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterCutiKhusus = db.define(
  "ms_cuti_khusus",
  {
    nama_cuti: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterCutiKhusus;
