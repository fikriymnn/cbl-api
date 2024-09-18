const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetakPeriodePointDefect = require("./inspeksiCetakPeriodeDefectModel");
const User = require("../../../userModel");

const InspeksiCetakPeriodeDefectDepartment = db.define(
  "cs_inspeksi_cetak_periode_defect_deparment",
  {
    id_inspeksi_cetak_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCetakPeriodePointDefect,
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

InspeksiCetakPeriodePointDefect.hasMany(InspeksiCetakPeriodeDefectDepartment, {
  foreignKey: "id_inspeksi_cetak_periode_point_defect",
  as: "inspeksi_cetak_periode_defect_department",
});
InspeksiCetakPeriodeDefectDepartment.belongsTo(
  InspeksiCetakPeriodePointDefect,
  {
    foreignKey: "id_inspeksi_cetak_periode_point_defect",
    as: "inspeksi_cetak_periode_defect",
  }
);

module.exports = InspeksiCetakPeriodeDefectDepartment;
