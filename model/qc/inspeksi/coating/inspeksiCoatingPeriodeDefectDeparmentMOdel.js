const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCoatingPeriodePointDefect = require("./inspeksiCoatingResultPointPeriodeModel");
const User = require("../../../userModel");

const InspeksiCoatingPeriodeDefectDepartment = db.define(
  "cs_inspeksi_coating_result_point_periode_department",
  {
    id_inspeksi_coating_periode_point_defect: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCoatingPeriodePointDefect,
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

InspeksiCoatingPeriodePointDefect.hasMany(
  InspeksiCoatingPeriodeDefectDepartment,
  {
    foreignKey: "id_inspeksi_coating_periode_point_defect",
    as: "inspeksi_coating_periode_defect_department",
  }
);
InspeksiCoatingPeriodeDefectDepartment.belongsTo(
  InspeksiCoatingPeriodePointDefect,
  {
    foreignKey: "id_inspeksi_coating_periode_point_defect",
    as: "inspeksi_coating_periode_defect",
  }
);

module.exports = InspeksiCoatingPeriodeDefectDepartment;
