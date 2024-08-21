const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const User = require("../../../userModel");

const InspeksiMasterPointFinal= db.define(
  "cs_master_inspeksi_final_point",
  {
    point: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    standar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cara_periksa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiMasterPointFinal;
