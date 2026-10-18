const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceApModel = require("./invoiceApModel");
const GoodReceipt = require("../goodReceipt/goodReceiptModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

const { DataTypes } = Sequelize;

// item invoice ap, 1 item = 1 good receipt
const InvoiceApItemModel = db.define(
  "invoice_ap_item",
  {
    id_invoice_ap: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InvoiceApModel,
        key: "id",
      },
    },
    id_good_receipt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GoodReceipt,
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
    no_good_receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_purchase_order: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    dpp: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    pajak: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    diskon_item: {
      type: DataTypes.DECIMAL(18, 0),
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
  },
);

InvoiceApModel.hasMany(InvoiceApItemModel, {
  foreignKey: "id_invoice_ap",
  as: "invoice_ap_item",
});
InvoiceApItemModel.belongsTo(InvoiceApModel, {
  foreignKey: "id_invoice_ap",
  as: "invoice_ap",
});

GoodReceipt.hasMany(InvoiceApItemModel, {
  foreignKey: "id_good_receipt",
  as: "invoice_ap_item",
});
InvoiceApItemModel.belongsTo(GoodReceipt, {
  foreignKey: "id_good_receipt",
  as: "good_receipt",
});

MasterBarang.hasMany(InvoiceApItemModel, {
  foreignKey: "id_item",
  as: "invoice_ap_item",
});
InvoiceApItemModel.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "item",
});

// relasi gr -> invoice ap (id_invoice_ap di good_receipt)
InvoiceApModel.hasMany(GoodReceipt, {
  foreignKey: "id_invoice_ap",
  constraints: false,
  as: "good_receipt",
});
GoodReceipt.belongsTo(InvoiceApModel, {
  foreignKey: "id_invoice_ap",
  constraints: false,
  as: "invoice_ap",
});

module.exports = InvoiceApItemModel;
