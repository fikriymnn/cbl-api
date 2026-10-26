const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// pembayaran invoice ap ke vendor, sisa lebih bayar menjadi deposit vendor
const InvoiceApPayment = db.define(
  "invoice_ap_payment",
  {
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterVendor,
        key: "id",
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    receipt_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // true: nomor pajak KT00001/CBL/10/26, false: nomor non pajak KT50001-1026
    is_tax: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    payment_amount: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
    },
    payment_amount_use: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      defaultValue: 0,
    },
    payment_proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "requested",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      { name: "idx_invoice_ap_payment_vendor", fields: ["vendor_id"] },
      { name: "idx_invoice_ap_payment_date", fields: ["payment_date"] },
      { name: "idx_invoice_ap_payment_status", fields: ["status"] },
    ],
  },
);

MasterVendor.hasMany(InvoiceApPayment, {
  foreignKey: "vendor_id",
  as: "invoice_ap_payments",
});
InvoiceApPayment.belongsTo(MasterVendor, {
  foreignKey: "vendor_id",
  as: "vendor",
});

Users.hasMany(InvoiceApPayment, {
  foreignKey: "created_by",
  as: "created_invoice_ap_payments",
});
InvoiceApPayment.belongsTo(Users, {
  foreignKey: "created_by",
  as: "created_user",
});

Users.hasMany(InvoiceApPayment, {
  foreignKey: "id_approve",
  as: "approved_invoice_ap_payments",
});
InvoiceApPayment.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "approved_user",
});

module.exports = InvoiceApPayment;
