const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiAmparLemPoint = require("./inspeksiAmparLemPointModel");
const InspeksiAmparLem = require("./inspeksiAmparLemModel");
const User = require("../../../userModel");

const InspeksiAmparLemDefect = db.define(
  "cs_inspeksi_ampar_lem_defect",
  {
    id_inspeksi_ampar_lem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InspeksiAmparLem,
        key: "id",
      },
    },
    id_inspeksi_ampar_lem_point: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiAmparLemPoint,
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

InspeksiAmparLem.hasMany(InspeksiAmparLemDefect, {
  foreignKey: "id_inspeksi_ampar_lem",
  as: "inspeksi_defect",
});
InspeksiAmparLemDefect.belongsTo(InspeksiAmparLem, {
  foreignKey: "id_inspeksi_ampar_lem",
  as: "inspeksi_ampar_lem",
});

InspeksiAmparLemPoint.hasMany(InspeksiAmparLemDefect, {
  foreignKey: "id_inspeksi_ampar_lem_point",
  as: "inspeksi_ampar_lem_defect",
});
InspeksiAmparLemDefect.belongsTo(InspeksiAmparLemPoint, {
  foreignKey: "id_inspeksi_ampar_lem_point",
  as: "inspeksi_ampar_lem_point",
});

module.exports = InspeksiAmparLemDefect;
