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
  as: "inspeksi_periode_periode_point",
});

module.exports = InspeksiCetakPeriodeDefect;
