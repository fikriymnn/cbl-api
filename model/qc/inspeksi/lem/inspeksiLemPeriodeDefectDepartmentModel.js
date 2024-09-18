const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLemPeriodePointDefect = require("./inspeksiLemPeriodeDefectModel");
const User = require("../../../userModel");

const InspeksiLemPeriodeDefectDepartment = db.define(
  "cs_inspeksi_lem_periode_defect_deparment",
  {
    id_inspeksi_lem_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiLemPeriodePointDefect,
        key: "id",
      },
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiLemPeriodePointDefect.hasMany(InspeksiLemPeriodeDefectDepartment, {
  foreignKey: "id_inspeksi_lem_periode_point_defect",
  as: "inspeksi_lem_periode_defect_department",
});
InspeksiLemPeriodeDefectDepartment.belongsTo(InspeksiLemPeriodePointDefect, {
  foreignKey: "id_inspeksi_lem_periode_point_defect",
  as: "inspeksi_lem_periode_defect",
});

module.exports = InspeksiLemPeriodeDefectDepartment;
