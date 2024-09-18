const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPondPeriodePointDefect = require("./inspeksiPondPeriodeDefectModel");
const User = require("../../../userModel");

const InspeksiPondPeriodeDefectDepartment = db.define(
  "cs_inspeksi_pond_periode_defect_deparment",
  {
    id_inspeksi_pond_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiPondPeriodePointDefect,
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

InspeksiPondPeriodePointDefect.hasMany(InspeksiPondPeriodeDefectDepartment, {
  foreignKey: "id_inspeksi_pond_periode_point_defect",
  as: "inspeksi_pond_periode_defect_department",
});
InspeksiPondPeriodeDefectDepartment.belongsTo(InspeksiPondPeriodePointDefect, {
  foreignKey: "id_inspeksi_pond_periode_point_defect",
  as: "inspeksi_pond_periode_defect",
});

module.exports = InspeksiPondPeriodeDefectDepartment;
