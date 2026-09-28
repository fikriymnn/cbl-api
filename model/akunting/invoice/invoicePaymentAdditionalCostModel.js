const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoicePaymentDetail = require("./invoicePaymentDetailModel");

const { DataTypes } = Sequelize;

const InvoicePaymentAdditionalCost = db.define(
  "invoice_payment_additional_cost",
  {
    invoice_payment_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InvoicePaymentDetail,
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
        name: "idx_invoice_payment_additional_cost_detail",
        fields: ["invoice_payment_detail_id"],
      },
    ],
  },
);

InvoicePaymentDetail.hasMany(InvoicePaymentAdditionalCost, {
  foreignKey: "invoice_payment_detail_id",
  as: "additional_costs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
InvoicePaymentAdditionalCost.belongsTo(InvoicePaymentDetail, {
  foreignKey: "invoice_payment_detail_id",
  as: "payment_detail",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = InvoicePaymentAdditionalCost;
