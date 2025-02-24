const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterSP = db.define(
  "ms_sp",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    masa_berlaku: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterSP;
