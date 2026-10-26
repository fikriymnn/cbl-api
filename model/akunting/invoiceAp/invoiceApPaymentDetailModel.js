const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceApModel = require("./invoiceApModel");
const InvoiceApPayment = require("./invoiceApPaymentModel");

const { DataTypes } = Sequelize;

const InvoiceApPaymentDetail = db.define(
  "invoice_ap_payment_detail",
  {
    invoice_ap_payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoiceApPayment,
        key: "id",
      },
    },
    invoice_ap_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoiceApModel,
        key: "id",
      },
    },
    payment_amount: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        name: "uniq_invoice_ap_payment_detail",
        unique: true,
        fields: ["invoice_ap_payment_id", "invoice_ap_id"],
      },
      {
        name: "idx_invoice_ap_payment_detail_invoice",
        fields: ["invoice_ap_id"],
      },
    ],
  },
);

InvoiceApPayment.hasMany(InvoiceApPaymentDetail, {
  foreignKey: "invoice_ap_payment_id",
  as: "payment_details",
});
InvoiceApPaymentDetail.belongsTo(InvoiceApPayment, {
  foreignKey: "invoice_ap_payment_id",
  as: "payment",
});

InvoiceApModel.hasMany(InvoiceApPaymentDetail, {
  foreignKey: "invoice_ap_id",
  as: "payment_details",
});
InvoiceApPaymentDetail.belongsTo(InvoiceApModel, {
  foreignKey: "invoice_ap_id",
  as: "invoice_ap",
});

module.exports = InvoiceApPaymentDetail;
