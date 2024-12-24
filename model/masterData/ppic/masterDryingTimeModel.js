const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMesin = require("../masterMesinModel");

const { DataTypes } = Sequelize;

const MasterDryingTime = db.define(
  "ms_drying_time",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jam: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterDryingTime;
