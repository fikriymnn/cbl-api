const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPoliban = db.define(
  "bom_poliban",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },

    item_poliban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isi_satu_ikat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lembar_poliban: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_poliban: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

BomModel.hasMany(BomPoliban, {
  foreignKey: "id_bom",
  as: "bom_poliban",
});
BomPoliban.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

module.exports = BomPoliban;
