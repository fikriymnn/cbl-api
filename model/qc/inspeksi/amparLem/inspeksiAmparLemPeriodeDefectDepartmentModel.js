const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiAmparLemPeriodePointDefect = require("./inspeksiAmparLemDefectModel");
const User = require("../../../userModel");

const InspeksiAmparLemPeriodeDefectDepartment = db.define(
  "cs_inspeksi_ampar_lem_periode_defect_deparment",
  {
    id_inspeksi_ampar_lem_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiAmparLemPeriodePointDefect,
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

InspeksiAmparLemPeriodePointDefect.hasMany(
  InspeksiAmparLemPeriodeDefectDepartment,
  {
    foreignKey: "id_inspeksi_ampar_lem_periode_point_defect",
    as: "inspeksi_ampar_lem_periode_defect_department",
  }
);
InspeksiAmparLemPeriodeDefectDepartment.belongsTo(
  InspeksiAmparLemPeriodePointDefect,
  {
    foreignKey: "id_inspeksi_ampar_lem_periode_point_defect",
    as: "inspeksi_ampar_lem_periode_defect",
  }
);

module.exports = InspeksiAmparLemPeriodeDefectDepartment;
