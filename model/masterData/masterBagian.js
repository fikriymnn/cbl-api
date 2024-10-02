const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const MasterBagian = db.define(
  "ms_bagian",
  {
    nama_bagian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterBagian;
