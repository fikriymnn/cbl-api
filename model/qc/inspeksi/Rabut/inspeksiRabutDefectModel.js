const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiRabutPoint = require("./inspeksiRabutPointModel");
const User = require("../../../userModel");

const InspeksiRabutDefect = db.define(
  "cs_inspeksi_rabut_defect",
  {
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
    hasil: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiRabutPoint.hasMany(InspeksiRabutDefect, {
  foreignKey: "id_inspeksi_rabut_point",
  as: "inspeksi_rabut_defect",
});
InspeksiRabutDefect.belongsTo(InspeksiRabutPoint, {
  foreignKey: "id_inspeksi_rabut_point",
  as: "inspeksi_rabut_point",
});

module.exports = InspeksiRabutDefect;
