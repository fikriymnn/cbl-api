const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterStatusKalibarsiAlatUkur = db.define(
  "ms_status_kalibrasi_alat_ukur",
  {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterStatusKalibarsiAlatUkur;
