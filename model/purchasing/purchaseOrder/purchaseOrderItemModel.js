const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrder = require("./purchaseOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const BomPpicModel = require("../../ppic/bomPpic/bomPpicModel");
const SoModel = require("../../marketing/so/soModel");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterBrand = require("../../masterData/barang/masterBrandModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const PurchaseOrderItem = db.define(
  "purchase_order_item",
  {
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
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
    id_brand: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBrand,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_beli: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    tipe_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("harga");
        return value === null ? null : Number(value);
      },
    },
    total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("total");
        return value === null ? null : Number(value);
      },
    },
    ppn: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("ppn");
        return value === null ? null : Number(value);
      },
    },
    is_ppn: {
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

PurchaseOrder.hasMany(PurchaseOrderItem, {
  foreignKey: "id_purchase_order",
  as: "items",
});
PurchaseOrderItem.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

MasterBarang.hasMany(PurchaseOrderItem, {
  foreignKey: "id_item",
  as: "items",
});
PurchaseOrderItem.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});
module.exports = PurchaseOrderItem;
