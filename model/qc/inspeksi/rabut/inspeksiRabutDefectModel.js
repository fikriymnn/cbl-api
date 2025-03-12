const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiRabutPoint = require("./inspeksiRabutPointModel");
const InspeksiRabut = require("./inspeksiRabutModel");
const User = require("../../../userModel");

const InspeksiRabutDefect = db.define(
  "cs_inspeksi_rabut_defect",
  {
    id_inspeksi_rabut: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InspeksiRabut,
        key: "id",
      },
    },
    id_inspeksi_rabut_point: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiRabutPoint,
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
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
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
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiRabut.hasMany(InspeksiRabutDefect, {
  foreignKey: "id_inspeksi_rabut",
  as: "inspeksi_defect",
});
InspeksiRabutDefect.belongsTo(InspeksiRabut, {
  foreignKey: "id_inspeksi_rabut",
  as: "inspeksi_rabut",
});

InspeksiRabutPoint.hasMany(InspeksiRabutDefect, {
  foreignKey: "id_inspeksi_rabut_point",
  as: "inspeksi_rabut_defect",
});
InspeksiRabutDefect.belongsTo(InspeksiRabutPoint, {
  foreignKey: "id_inspeksi_rabut_point",
  as: "inspeksi_rabut_point",
});

module.exports = InspeksiRabutDefect;
