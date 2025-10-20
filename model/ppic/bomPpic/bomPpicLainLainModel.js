const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");

const { DataTypes } = Sequelize;

const BomPpicLainLain = db.define(
  "bom_ppic_lain_lain",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_beli: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    qty_stok: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
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

BomPpicModel.hasMany(BomPpicLainLain, {
  foreignKey: "id_bom_ppic",
  as: "lain_lain",
});
BomPpicLainLain.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

module.exports = BomPpicLainLain;
