const { Sequelize } = require("sequelize");
const db = require("../../config/databaseFinger");

const { DataTypes } = Sequelize;

const KaryawanModel = db.define(
  "USERINFO",
  {
    USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
    },
    name: {
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
