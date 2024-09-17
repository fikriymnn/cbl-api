const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const MasalahCetak = require("../inspeksi/masterKodeMasalahCetakModel");
const User = require("../../../userModel");

const MasterDepartment = db.define(
  "master_department",
  {
    nama_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    value_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

// MasterDepartment.belongsToMany(MasalahCetak, {
//   through: "cs_master_inspeksi_cetak_periode_defectmaster_department",
// });

module.exports = MasterDepartment;
