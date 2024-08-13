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

InspeksiLemPeriodePoint.hasMany(InspeksiLemPeriodeDefect, {
  foreignKey: "id_inspeksi_lem_periode_point",
  as: "inspeksi_lem_periode_defect",
});
InspeksiLemPeriodeDefect.belongsTo(InspeksiLemPeriodePoint, {
  foreignKey: "id_inspeksi_lem_periode_point",
  as: "inspeksi_lem_periode_point",
});

module.exports = InspeksiLemPeriodeDefect;
