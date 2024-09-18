const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiRabutPeriodePointDefect = require("./inspeksiRabutDefectModel");
const User = require("../../../userModel");

const InspeksiRabutPeriodeDefectDepartment = db.define(
  "cs_inspeksi_rabut_periode_defect_deparment",
  {
    id_inspeksi_rabut_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiRabutPeriodePointDefect,
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

InspeksiRabutPeriodePointDefect.hasMany(InspeksiRabutPeriodeDefectDepartment, {
  foreignKey: "id_inspeksi_rabut_periode_point_defect",
  as: "inspeksi_rabut_periode_defect_department",
});
InspeksiRabutPeriodeDefectDepartment.belongsTo(
  InspeksiRabutPeriodePointDefect,
  {
    foreignKey: "id_inspeksi_rabut_periode_point_defect",
    as: "inspeksi_rabut_periode_defect",
  }
);

module.exports = InspeksiRabutPeriodeDefectDepartment;
