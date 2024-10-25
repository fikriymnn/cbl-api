const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterGrade = db.define(
  "ms_grade",
  {
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterGrade;
