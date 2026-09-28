const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const InvoicePayment = db.define(
  "invoice_payment",
  {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterCustomer,
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
      { name: "idx_invoice_payment_customer", fields: ["customer_id"] },
      { name: "idx_invoice_payment_date", fields: ["payment_date"] },
      { name: "idx_invoice_payment_status", fields: ["status"] },
    ],
  },
);

MasterCustomer.hasMany(InvoicePayment, {
  foreignKey: "customer_id",
  as: "invoice_payments",
});
InvoicePayment.belongsTo(MasterCustomer, {
  foreignKey: "customer_id",
  as: "customer",
});

Users.hasMany(InvoicePayment, {
  foreignKey: "created_by",
  as: "created_invoice_payments",
});
InvoicePayment.belongsTo(Users, {
  foreignKey: "created_by",
  as: "created_user",
});

Users.hasMany(InvoicePayment, {
  foreignKey: "id_approve",
  as: "approved_invoice_payments",
});
InvoicePayment.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "approved_user",
});

module.exports = InvoicePayment;
