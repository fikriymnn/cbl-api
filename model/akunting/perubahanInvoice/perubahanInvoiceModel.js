const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceModel = require("../invoice/invoiceModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const PerubahanInvoiceModel = db.define(
  "perubahan_invoice",
  {
    id_invoice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InvoiceModel,
        key: "id",
      },
    },
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterCustomer,
        key: "id",
      },
    },
    id_create: {
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
    id_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_perubahan_invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_invoice: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_pengajuan: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    tgl_faktur: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    new_alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    new_tgl_faktur: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
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

MasterCustomer.hasMany(PerubahanInvoiceModel, {
  foreignKey: "id_customer",
  as: "perubahan_invoice",
});
PerubahanInvoiceModel.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});

Users.hasMany(PerubahanInvoiceModel, {
  foreignKey: "id_create",
  as: "perubahan_invoice_create",
});
PerubahanInvoiceModel.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(PerubahanInvoiceModel, {
  foreignKey: "id_approve",
  as: "perubahan_invoice_approve",
});
PerubahanInvoiceModel.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
Users.hasMany(PerubahanInvoiceModel, {
  foreignKey: "id_reject",
  as: "perubahan_invoice_reject",
});
PerubahanInvoiceModel.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = PerubahanInvoiceModel;
