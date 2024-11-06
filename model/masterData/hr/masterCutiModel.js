const { Sequelize } = require("sequelize");
const db = require("../../../config/databaseFinger");

const { DataTypes } = Sequelize;

const MasterCuti = db.define(
  "ms_cuti",
  {
    jumlah_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterCuti;
