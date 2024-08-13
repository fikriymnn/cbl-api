const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPondPeriodePoint = require("./inspeksiPondPeriodePointModel");
const User = require("../../../userModel");

const InspeksiPondPeriodeDefect = db.define(
  "cs_inspeksi_pond_periode_defect",
  {
    id_inspeksi_pond_periode_point: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiPondPeriodePoint,
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

InspeksiPondPeriodePoint.hasMany(InspeksiPondPeriodeDefect, {
  foreignKey: "id_inspeksi_pond_periode_point",
  as: "inspeksi_pond_periode_defect",
});
InspeksiPondPeriodeDefect.belongsTo(InspeksiPondPeriodePoint, {
  foreignKey: "id_inspeksi_pond_periode_point",
  as: "inspeksi_pond_periode_point",
});

module.exports = InspeksiPondPeriodeDefect;
