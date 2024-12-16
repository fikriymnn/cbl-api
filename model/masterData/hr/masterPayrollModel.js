const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterDivisi = db.define(
  "ms_payroll",
  {
    uang_makan_lembur_per: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    upah_sakit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterDivisi;
