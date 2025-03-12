const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiChemical = require("./inspeksiChemicalModel");
const User = require("../../../userModel");

const InspeksiChemicalPoint = db.define(
  "cs_inspeksi_chemical_point",
  {
    id_inspeksi_chemical: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiChemical,
        key: "id",
      },
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    standar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
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

InspeksiChemical.hasMany(InspeksiChemicalPoint, {
  foreignKey: "id_inspeksi_chemical",
  as: "inspeksi_chemical_point",
});
InspeksiChemicalPoint.belongsTo(InspeksiChemical, {
  foreignKey: "id_inspeksi_chemical",
  as: "inspeksi_chemical",
});

module.exports = InspeksiChemicalPoint;
