const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiCoatingPointMasterPeriode = db.define(
  "cs_inspeksi_coating_point_master_periode",
  { 
      point: {
        type: DataTypes.STRING,
        allowNull: true
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true
      }
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiCoatingPointMasterPeriode;