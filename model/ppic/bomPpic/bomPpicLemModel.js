const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpicLem = db.define(
  "bom_ppic_lem",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
        key: "id",
      },
    },
    id_lem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },

    nama_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rumus_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    qty_konstanta: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    qty_lem: {
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

BomPpicModel.hasMany(BomPpicLem, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_lem",
});
BomPpicLem.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(BomPpicLem, {
  foreignKey: "id_lem",
  as: "bom_ppic_lem",
});
BomPpicLem.belongsTo(MasterBarang, {
  foreignKey: "id_lem",
  as: "lem",
});

module.exports = BomPpicLem;
