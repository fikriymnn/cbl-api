const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const InvoiceModel = require("../../akunting/invoice/invoiceModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const ReturModel = db.define(
  "retur",
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
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_retur: {
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
    total: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    note: {
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

InvoiceModel.hasMany(ReturModel, {
  foreignKey: "id_invoice",
  as: "retur",
});
ReturModel.belongsTo(InvoiceModel, {
  foreignKey: "id_invoice",
  as: "invoice",
});

MasterCustomer.hasMany(ReturModel, {
  foreignKey: "id_customer",
  as: "retur",
});
ReturModel.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});

Users.hasMany(ReturModel, {
  foreignKey: "id_create",
  as: "retur_create",
});
ReturModel.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(ReturModel, {
  foreignKey: "id_approve",
  as: "retur_approve",
});
ReturModel.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
Users.hasMany(ReturModel, {
  foreignKey: "id_reject",
  as: "retur_reject",
});
ReturModel.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = ReturModel;
