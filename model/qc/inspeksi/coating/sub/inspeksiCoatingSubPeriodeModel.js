const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../../config/database");
const InspeksiCoating = require("../inspeksiCoatingModel");

const InspeksiCoatingSubPeriode = db.define(
  "cs_inspeksi_coating_sub_periode",
  {
    id_inspeksi_coating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoating,
        key: "id",
      },
    },
    sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCoating.hasMany(InspeksiCoatingSubPeriode, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating_sub_periode",
});
InspeksiCoatingSubPeriode.belongsTo(InspeksiCoating, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating",
});

module.exports = InspeksiCoatingSubPeriode;
