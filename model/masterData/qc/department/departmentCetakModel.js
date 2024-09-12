const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const masalahCetak = require("../inspeksi/masterKodeMasalahCetakModel");
const masterDepartment = require("./masterDepartmentModel");
const MasterDepartmentCetak = db.define(
  "ms_department_cetak",
  {
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: masterDepartment,
        key: "id",
      },
    },
    id_masalah_cetak: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: masalahCetak,
        key: "id",
      },
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

masalahCetak.hasMany(MasterDepartmentCetak, {
  foreignKey: "id_masalah_cetak",
  as: "department_cetak",
});
MasterDepartmentCetak.belongsTo(masalahCetak, {
  foreignKey: "id_masalah_cetak",
});

masterDepartment.hasMany(MasterDepartmentCetak, {
  foreignKey: "id_department",
});
MasterDepartmentCetak.belongsTo(masterDepartment, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = MasterDepartmentCetak;
