const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceApPaymentDetail = require("./invoiceApPaymentDetailModel");

const { DataTypes } = Sequelize;

const InvoiceApPaymentAdditionalCost = db.define(
  "invoice_ap_payment_additional_cost",
  {
    invoice_ap_payment_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoiceApPaymentDetail,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        name: "idx_invoice_ap_payment_additional_cost_detail",
        fields: ["invoice_ap_payment_detail_id"],
      },
    ],
  },
);

InvoiceApPaymentDetail.hasMany(InvoiceApPaymentAdditionalCost, {
  foreignKey: "invoice_ap_payment_detail_id",
  as: "additional_costs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
InvoiceApPaymentAdditionalCost.belongsTo(InvoiceApPaymentDetail, {
  foreignKey: "invoice_ap_payment_detail_id",
  as: "payment_detail",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = InvoiceApPaymentAdditionalCost;
