const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const InvoiceModel = require("./invoiceModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const InvoiceProdukModel = db.define(
  "invoice_produk",
  {
    id_invoice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InvoiceModel,
        key: "id",
      },
    },
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterProduk,
        key: "id",
      },
    },

    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
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
    diskon_produk: {
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
  }
);

InvoiceModel.hasMany(InvoiceProdukModel, {
  foreignKey: "id_invoice",
  as: "invoice_produk",
});
InvoiceProdukModel.belongsTo(InvoiceModel, {
  foreignKey: "id_invoice",
  as: "invoice",
});

MasterProduk.hasMany(InvoiceProdukModel, {
  foreignKey: "id_produk",
  as: "invoice",
});
InvoiceProdukModel.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "produk",
});

module.exports = InvoiceProdukModel;
