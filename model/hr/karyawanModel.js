const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const KaryawanModel = db.define(
  "userinfo",
  {
    userid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    badgenumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = KaryawanModel;
