const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceModel = require("./invoiceModel");
const InvoicePayment = require("./invoicePaymentModel");

const { DataTypes } = Sequelize;

const InvoicePaymentDetail = db.define(
  "invoice_payment_detail",
  {
    invoice_payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoicePayment,
        key: "id",
      },
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoiceModel,
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
        name: "uniq_invoice_payment_detail",
        unique: true,
        fields: ["invoice_payment_id", "invoice_id"],
      },
      { name: "idx_invoice_payment_detail_invoice", fields: ["invoice_id"] },
    ],
  },
);

InvoicePayment.hasMany(InvoicePaymentDetail, {
  foreignKey: "invoice_payment_id",
  as: "payment_details",
});
InvoicePaymentDetail.belongsTo(InvoicePayment, {
  foreignKey: "invoice_payment_id",
  as: "payment",
});

InvoiceModel.hasMany(InvoicePaymentDetail, {
  foreignKey: "invoice_id",
  as: "payment_details",
});
InvoicePaymentDetail.belongsTo(InvoiceModel, {
  foreignKey: "invoice_id",
  as: "invoice",
});

module.exports = InvoicePaymentDetail;
