const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCoatingResultPeriode = require("./result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoating = require("./inspeksiCoatingModel");

const InspeksiCoatingResultPointPeriode = db.define(
  "cs_inspeksi_coating_result_point_periode",
  {
    id_inspeksi_coating_result_periode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoatingResultPeriode,
        key: "id",
      },
    },
    id_inspeksi_coating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoating,
        key: "id",
      },
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_defect: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sumber_masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kriteria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    persen_kriteria: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
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

InspeksiCoating.hasMany(InspeksiCoatingResultPointPeriode, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating_result_point_periode",
});
InspeksiCoatingResultPointPeriode.belongsTo(InspeksiCoating, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating",
});

module.exports = InspeksiCoatingResultPointPeriode;
