const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomLem = db.define(
  "bom_lem",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
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
    qty_lock_bottom: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_lem_samping: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_four_corner: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_samping_lock_bottom: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_six_corner: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_ujung_lock_bottom: {
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

BomModel.hasMany(BomLem, {
  foreignKey: "id_bom",
  as: "bom_lem",
});
BomLem.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

MasterBarang.hasMany(BomLem, {
  foreignKey: "id_lem",
  as: "bom_coating_depan",
});
BomLem.belongsTo(MasterBarang, {
  foreignKey: "id_lem",
  as: "lem",
});

module.exports = BomLem;
