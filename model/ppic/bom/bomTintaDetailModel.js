const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomTintaModel = require("./bomTintaModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

const { DataTypes } = Sequelize;

const BomTintaDetail = db.define(
  "bom_tinta_detail",
  {
    id_bom_tinta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomTintaModel,
        key: "id",
      },
    },
    id_item_tinta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_item_tinta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    persentase_tinta: {
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

BomTintaModel.hasMany(BomTintaDetail, {
  foreignKey: "id_bom_tinta",
  as: "tinta_detail",
});
BomTintaDetail.belongsTo(BomTintaModel, {
  foreignKey: "id_bom_tinta",
  as: "tinta",
});

MasterBarang.hasMany(BomTintaDetail, {
  foreignKey: "id_item_tinta",
  as: "bom_tinta_detail",
});
BomTintaDetail.belongsTo(MasterBarang, {
  foreignKey: "id_item_tinta",
  as: "tinta_item",
});

module.exports = BomTintaDetail;
