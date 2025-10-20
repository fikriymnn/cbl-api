const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpicKertas = db.define(
  "bom_ppic_kertas",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
        key: "id",
      },
    },
    id_kertas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },

    nama_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_lembar_plano: {
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

BomPpicModel.hasMany(BomPpicKertas, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_kertas",
});
BomPpicKertas.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(BomPpicKertas, {
  foreignKey: "id_kertas",
  as: "bom_ppic_kertas",
});
BomPpicKertas.belongsTo(MasterBarang, {
  foreignKey: "id_kertas",
  as: "kertas",
});

module.exports = BomPpicKertas;
