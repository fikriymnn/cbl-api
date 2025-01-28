const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const CheckInOut = db.define(
  "checkinout",
  {
    userid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    checktime: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true,
    },
    checktype: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },
    verifycode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    SN: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sensorid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    WorkCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },
    Reserved: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = CheckInOut;
