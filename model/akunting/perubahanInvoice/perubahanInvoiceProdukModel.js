const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PerubahanInvoiceModel = require("./perubahanInvoiceModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const InvoiceProdukModel = require("../invoice/invoiceProdukModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const PerubahanInvoiceProdukModel = db.define(
  "perubahan_invoice_produk",
  {
    id_perubahan_invoice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PerubahanInvoiceModel,
        key: "id",
      },
    },
    id_invoice_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InvoiceProdukModel,
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
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    new_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    new_harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
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

PerubahanInvoiceModel.hasMany(PerubahanInvoiceProdukModel, {
  foreignKey: "id_perubahan_invoice",
  as: "perubahan_invoice_produk",
});
PerubahanInvoiceProdukModel.belongsTo(PerubahanInvoiceModel, {
  foreignKey: "id_perubahan_invoice",
  as: "perubahan_invoice",
});

MasterProduk.hasMany(PerubahanInvoiceProdukModel, {
  foreignKey: "id_produk",
  as: "perubahan_invoice",
});
PerubahanInvoiceProdukModel.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "produk",
});

module.exports = PerubahanInvoiceProdukModel;
