const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomCorrugated = db.define(
  "bom_corrugated",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },
    id_corrugated: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_corrugated: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isi_per_pack: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_corrugated: {
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

BomModel.hasMany(BomCorrugated, {
  foreignKey: "id_bom",
  as: "bom_corrugated",
});
BomCorrugated.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

MasterBarang.hasMany(BomCorrugated, {
  foreignKey: "id_corrugated",
  as: "bom_corrugated",
});
BomCorrugated.belongsTo(MasterBarang, {
  foreignKey: "id_corrugated",
  as: "corrugated",
});

module.exports = BomCorrugated;
