const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// invoice ap (hutang ke vendor), dibuat dari list good receipt dengan vendor yang sama
const InvoiceApModel = db.define(
  "invoice_ap",
  {
    id_vendor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterVendor,
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
    nama_vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // nomor invoice dari vendor
    no_invoice_vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
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
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    dpp: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    diskon: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    ppn: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    dp: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    balance_due: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: false,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_show_dpp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_tax: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
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
    tgl_pelunasan: {
      type: DataTypes.DATE,
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
  },
);

MasterVendor.hasMany(InvoiceApModel, {
  foreignKey: "id_vendor",
  as: "invoice_ap",
});
InvoiceApModel.belongsTo(MasterVendor, {
  foreignKey: "id_vendor",
  as: "vendor",
});

Users.hasMany(InvoiceApModel, {
  foreignKey: "id_create",
  as: "invoice_ap_create",
});
InvoiceApModel.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(InvoiceApModel, {
  foreignKey: "id_approve",
  as: "invoice_ap_approve",
});
InvoiceApModel.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});

Users.hasMany(InvoiceApModel, {
  foreignKey: "id_reject",
  as: "invoice_ap_reject",
});
InvoiceApModel.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = InvoiceApModel;
