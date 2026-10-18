const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IncomingRawMaterial = require("../../qc/incomingRawMaterial/incomingRawMaterialModel");
const PurchaseOrder = require("../../purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItemJo = require("../../purchasing/purchaseOrder/purchaseOrderItemJoModel");
const PurchaseOrderBooking = require("../../purchasing/purchaseOrderBooking/purchaseOrderBookingModel");
const PurchaseOrderBookingItem = require("../../purchasing/purchaseOrderBooking/purchaseOrderBookingItemModel");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// list GR akunting, dibuat otomatis saat incoming raw material di approve
const GoodReceipt = db.define(
  "good_receipt",
  {
    id_incoming_raw_material: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IncomingRawMaterial,
        key: "id",
      },
    },
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    id_purchase_order_item_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrderItemJo,
        key: "id",
      },
    },
    id_purchase_order_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrderBooking,
        key: "id",
      },
    },
    // tanpa foreign key constraint di db: nama constraint otomatis > 64 karakter, batas mysql
    id_purchase_order_booking_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_vendor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterVendor,
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
    id_request: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    // diisi saat GR dibuatkan invoice ap
    id_invoice_ap: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_purchase_order: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_good_receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_incoming: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_idle: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_pallet: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    // qty yang ditagihkan = qty_incoming + qty_idle
    qty: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    // harga satuan dari item PO / item PO booking
    harga: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      defaultValue: 0,
    },
    is_ppn: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    tgl_request: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_action: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_created_invoice: {
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
  },
);

IncomingRawMaterial.hasOne(GoodReceipt, {
  foreignKey: "id_incoming_raw_material",
  as: "good_receipt",
});
GoodReceipt.belongsTo(IncomingRawMaterial, {
  foreignKey: "id_incoming_raw_material",
  as: "incoming_raw_material",
});

PurchaseOrder.hasMany(GoodReceipt, {
  foreignKey: "id_purchase_order",
  as: "good_receipt",
});
GoodReceipt.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

PurchaseOrderItemJo.hasMany(GoodReceipt, {
  foreignKey: "id_purchase_order_item_jo",
  as: "good_receipt",
});
GoodReceipt.belongsTo(PurchaseOrderItemJo, {
  foreignKey: "id_purchase_order_item_jo",
  as: "purchase_order_item_jo",
});

PurchaseOrderBooking.hasMany(GoodReceipt, {
  foreignKey: "id_purchase_order_booking",
  as: "good_receipt",
});
GoodReceipt.belongsTo(PurchaseOrderBooking, {
  foreignKey: "id_purchase_order_booking",
  as: "purchase_order_booking",
});

PurchaseOrderBookingItem.hasMany(GoodReceipt, {
  foreignKey: "id_purchase_order_booking_item",
  constraints: false,
  as: "good_receipt",
});
GoodReceipt.belongsTo(PurchaseOrderBookingItem, {
  foreignKey: "id_purchase_order_booking_item",
  constraints: false,
  as: "purchase_order_booking_item",
});

MasterVendor.hasMany(GoodReceipt, {
  foreignKey: "id_vendor",
  as: "good_receipt",
});
GoodReceipt.belongsTo(MasterVendor, {
  foreignKey: "id_vendor",
  as: "vendor",
});

MasterBarang.hasMany(GoodReceipt, {
  foreignKey: "id_item",
  as: "good_receipt",
});
GoodReceipt.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "item",
});

Users.hasMany(GoodReceipt, {
  foreignKey: "id_request",
  as: "good_receipt_request",
});
GoodReceipt.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

Users.hasMany(GoodReceipt, {
  foreignKey: "id_approve",
  as: "good_receipt_approve",
});
GoodReceipt.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});

module.exports = GoodReceipt;
