const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const InvoiceModel = db.define(
  "invoice",
  {
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
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_po: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_do: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_faktur: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_jatuh_tempo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_jatuh_tempo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sub_total: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dpp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    diskon: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ppn: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    balance_due: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_show_dpp: {
      type: DataTypes.BOOLEAN,
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
    status_payment: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "belum lunas",
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

MasterCustomer.hasMany(InvoiceModel, {
  foreignKey: "id_customer",
  as: "invoice",
});
InvoiceModel.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});

Users.hasMany(InvoiceModel, {
  foreignKey: "id_create",
  as: "invoice_create",
});
InvoiceModel.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(InvoiceModel, {
  foreignKey: "id_approve",
  as: "invoice_approve",
});
InvoiceModel.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
Users.hasMany(InvoiceModel, {
  foreignKey: "id_reject",
  as: "invoice_reject",
});
InvoiceModel.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = InvoiceModel;
