const { Sequelize } = require("sequelize");
const db = require("../../config/databaseFinger");

const { DataTypes } = Sequelize;

const CheckInOut = db.define(
  "CHECKINOUT",
  {
    USERID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CHECKTIME: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true,
    },
    CHECKTYPE: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "I",
    },
    VERIFYCODE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    SENSORID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Memoinfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    WorkCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },
    sn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UserExtFmt: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0,
    },
    mask_flag: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    temperature: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = CheckInOut;
