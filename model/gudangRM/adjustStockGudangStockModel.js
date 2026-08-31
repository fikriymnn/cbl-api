const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const GudangRawmaterialStock = require("./gudangRawMaterialStock/gudangRawMaterialStockModel");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterBarang = require("../masterData/barang/masterBarangModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const AdjustStockGudangStock = db.define(
  "adjust_stock_raw_material_stock",
  {
    id_gudang_raw_material_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangRawmaterialStock,
        key: "id",
      },
    },
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_qty_awal: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_qty_adjust: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_adjust: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
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
  },
);

GudangRawmaterialStock.hasMany(AdjustStockGudangStock, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "adjust_stock_raw_material_stock",
});
AdjustStockGudangStock.belongsTo(GudangRawmaterialStock, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "gudang_raw_material_stock",
});

MasterBarang.hasMany(AdjustStockGudangStock, {
  foreignKey: "id_item",
  as: "adjust_stock_raw_material_stock",
});
AdjustStockGudangStock.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "item",
});

Users.hasMany(AdjustStockGudangStock, {
  foreignKey: "id_user",
  as: "adjust_stock_raw_material_stock",
});
AdjustStockGudangStock.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = AdjustStockGudangStock;
