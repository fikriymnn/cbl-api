const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const ReturModel = require("./returModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const ReturProdukModel = db.define(
  "retur_produk",
  {
    id_retur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ReturModel,
        key: "id",
      },
    },
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterProduk,
        key: "id",
      },
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dpp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pajak: {
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

ReturModel.hasMany(ReturProdukModel, {
  foreignKey: "id_retur",
  as: "retur_produk",
});
ReturProdukModel.belongsTo(ReturModel, {
  foreignKey: "id_retur",
  as: "retur",
});

MasterProduk.hasMany(ReturProdukModel, {
  foreignKey: "id_produk",
  as: "retur",
});
ReturProdukModel.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "produk",
});

module.exports = ReturProdukModel;
