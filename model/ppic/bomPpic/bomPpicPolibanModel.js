const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const Users = require("../../userModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

const { DataTypes } = Sequelize;

const BomPpicPoliban = db.define(
  "bom_ppic_poliban",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
        key: "id",
      },
    },
    id_item_poliban: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_item_poliban: {
      type: DataTypes.STRING,
      allowNull: true,
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

BomPpicModel.hasMany(BomPpicPoliban, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_poliban",
});
BomPpicPoliban.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(BomPpicPoliban, {
  foreignKey: "id_item_poliban",
  as: "bom_ppic_poliban",
});
BomPpicPoliban.belongsTo(MasterBarang, {
  foreignKey: "id_item_poliban",
  as: "poliban",
});

module.exports = BomPpicPoliban;
