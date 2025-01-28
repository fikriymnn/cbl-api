const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterDepartment = db.define(
  "ms_department",
  {
    nama_department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterDepartment;
