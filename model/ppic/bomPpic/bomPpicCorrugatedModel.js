const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpicCorrugated = db.define(
  "bom_ppic_corrugated",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
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

BomPpicModel.hasMany(BomPpicCorrugated, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_corrugated",
});
BomPpicCorrugated.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(BomPpicCorrugated, {
  foreignKey: "id_corrugated",
  as: "bom_ppic_corrugated",
});
BomPpicCorrugated.belongsTo(MasterBarang, {
  foreignKey: "id_corrugated",
  as: "corrugated",
});

module.exports = BomPpicCorrugated;
