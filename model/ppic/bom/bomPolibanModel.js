const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const Users = require("../../userModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

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

MasterBarang.hasMany(BomPoliban, {
  foreignKey: "id_item_poliban",
  as: "bom_poliban",
});
BomPoliban.belongsTo(MasterBarang, {
  foreignKey: "id_item_poliban",
  as: "poliban",
});

module.exports = BomPoliban;
