const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomKertas = db.define(
  "bom_kertas",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
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

BomModel.hasMany(BomKertas, {
  foreignKey: "id_bom",
  as: "bom_kertas",
});
BomKertas.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

MasterBarang.hasMany(BomKertas, {
  foreignKey: "id_kertas",
  as: "bom_kertas",
});
BomKertas.belongsTo(MasterBarang, {
  foreignKey: "id_kertas",
  as: "kertas",
});

module.exports = BomKertas;
