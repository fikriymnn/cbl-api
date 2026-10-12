const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrderBooking = require("./purchaseOrderBookingModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterBrand = require("../../masterData/barang/masterBrandModel");

const { DataTypes } = Sequelize;

const PurchaseOrderBookingItem = db.define(
  "purchase_order_booking_item",
  {
    id_purchase_order_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrderBooking,
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
    // qty yang sudah datang (incoming approve qc)
    qty_terkirim: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    // qty_beli - qty_terkirim
    qty_sisa: {
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
    status_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_po: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "progress",
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

PurchaseOrderBooking.hasMany(PurchaseOrderBookingItem, {
  foreignKey: "id_purchase_order_booking",
  as: "items",
});
PurchaseOrderBookingItem.belongsTo(PurchaseOrderBooking, {
  foreignKey: "id_purchase_order_booking",
  as: "purchase_order_booking",
});

MasterBarang.hasMany(PurchaseOrderBookingItem, {
  foreignKey: "id_item",
  as: "purchase_order_booking_items",
});
PurchaseOrderBookingItem.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

module.exports = PurchaseOrderBookingItem;
