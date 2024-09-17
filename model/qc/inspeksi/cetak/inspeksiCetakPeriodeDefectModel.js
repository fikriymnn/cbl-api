const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetakPeriodePoint = require("./inspeksiCetakPeriodePointModel");
const User = require("../../../userModel");

const InspeksiCetakPeriodeDefect = db.define(
  "cs_inspeksi_cetak_periode_defect",
  {
    id_inspeksi_cetak_periode_point: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCetakPeriodePoint,
        key: "id",
      },
    },
    id_inspeksi_cetak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_master_defect: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
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
  },
  {
    freezeTableName: true,
  }
);

InspeksiCetakPeriodePoint.hasMany(InspeksiCetakPeriodeDefect, {
  foreignKey: "id_inspeksi_cetak_periode_point",
  as: "inspeksi_cetak_periode_defect",
});
InspeksiCetakPeriodeDefect.belongsTo(InspeksiCetakPeriodePoint, {
  foreignKey: "id_inspeksi_cetak_periode_point",
  as: "inspeksi_cetak_periode_point",
});

module.exports = InspeksiCetakPeriodeDefect;
