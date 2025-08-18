const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLemPeriodePoint = require("./inspeksiLemPeriodePointModel");
const User = require("../../../userModel");

const InspeksiLemPeriodeDefect = db.define(
  "cs_inspeksi_lem_periode_defect",
  {
    id_inspeksi_lem_periode_point: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiLemPeriodePoint,
        key: "id",
      },
    },
    id_inspeksi_lem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah_lkh: {
      type: DataTypes.STRING,
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
    hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_defect: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_up_defect: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiLemPeriodePoint.hasMany(InspeksiLemPeriodeDefect, {
  foreignKey: "id_inspeksi_lem_periode_point",
  as: "inspeksi_lem_periode_defect",
});
InspeksiLemPeriodeDefect.belongsTo(InspeksiLemPeriodePoint, {
  foreignKey: "id_inspeksi_lem_periode_point",
  as: "inspeksi_lem_periode_point",
});

module.exports = InspeksiLemPeriodeDefect;
