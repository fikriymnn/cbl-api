const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterMainGrupSkorAnalisis = db.define(
  "ms_main_grup_kode_analisis",
  {
    kode_kendala: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_kendala: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterMainGrupSkorAnalisis;
