const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterGrade = db.define(
  "ms_hr_grade",
  {
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterGrade;
