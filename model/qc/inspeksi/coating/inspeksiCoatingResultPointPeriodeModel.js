const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCoatingResultPeriode = require('./inspeksiCoatingResultPeriodeModel')

const InspeksiCoatingResultPointPeriode = db.define(
  "cs_inspeksi_coating_result_point_periode",
  { 
    id_inspeksi_coating_result_periode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoatingResultPeriode
      }
    },
    point: {
        type: DataTypes.STRING,
        allowNull: true
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true
      }
  },
  {
    freezeTableName: true,
  }
);

InspeksiCoatingResultPeriode.hasMany(InspeksiCoatingResultPointPeriode, {
    foreignKey: "id_inspeksi_coating_result_periode",
    as: "inspeksi_coating_result_point_periode",
  });
InspeksiCoatingResultPointPeriode.belongsTo(InspeksiCoatingResultPeriode, {
    foreignKey: "id_inspeksi_coating_result_periode",
    as: "inspeksi_coating_result_periode",
  });

module.exports = InspeksiCoatingResultPointPeriode;