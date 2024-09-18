const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const User = require("../../../userModel");

const InspeksiMasterPointOutsourcingBJ = db.define(
  "cs_master_inspeksi_outsourcing_bj_point",
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
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiMasterPointOutsourcingBJ;
