const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicTintaModel = require("./bomPpicTintaModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

const { DataTypes } = Sequelize;

const BomPpicTintaDetail = db.define(
  "bom_ppic_tinta_detail",
  {
    id_bom_ppic_tinta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicTintaModel,
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
    qty_tinta: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
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

BomPpicTintaModel.hasMany(BomPpicTintaDetail, {
  foreignKey: "id_bom_ppic_tinta",
  as: "tinta_detail",
});
BomPpicTintaDetail.belongsTo(BomPpicTintaModel, {
  foreignKey: "id_bom_ppic_tinta",
  as: "tinta",
});

MasterBarang.hasMany(BomPpicTintaDetail, {
  foreignKey: "id_item_tinta",
  as: "bom_ppic_tinta_detail",
});
BomPpicTintaDetail.belongsTo(MasterBarang, {
  foreignKey: "id_item_tinta",
  as: "tinta_item",
});

module.exports = BomPpicTintaDetail;
