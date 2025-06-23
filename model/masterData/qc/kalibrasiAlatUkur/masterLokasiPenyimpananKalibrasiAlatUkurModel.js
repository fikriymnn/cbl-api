const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterLokasiKalibarsiAlatUkur = db.define(
  "ms_lokasi_kalibrasi_alat_ukur",
  {
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterLokasiKalibarsiAlatUkur;
