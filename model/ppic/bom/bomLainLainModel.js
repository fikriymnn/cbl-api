const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");

const { DataTypes } = Sequelize;

const BomLainLain = db.define(
  "bom_lain_lain",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
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

BomModel.hasMany(BomLainLain, {
  foreignKey: "id_bom",
  as: "lain_lain",
});
BomLainLain.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

module.exports = BomLainLain;
