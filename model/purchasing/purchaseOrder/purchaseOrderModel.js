const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoModel = require("../../marketing/io/ioModel");
const BomPpicModel = require("../../ppic/bomPpic/bomPpicModel");
const SoModel = require("../../marketing/so/soModel");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const PurchaseOrder = db.define(
  "purchase_order",
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
    id_request: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_kabag: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_finance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_reject_kabag: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_reject_finance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_purchase_order: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_po: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sub_total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("sub_total");
        return value === null ? null : Number(value);
      },
    },
    discount: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("discount");
        return value === null ? null : Number(value);
      },
    },
    ppn: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("ppn");
        return value === null ? null : Number(value);
      },
    },
    total: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
      get() {
        const value = this.getDataValue("total");
        return value === null ? null : Number(value);
      },
    },
    note_internal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_tiket: {
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

MasterVendor.hasMany(PurchaseOrder, {
  foreignKey: "id_vendor",
  as: "purchase_orders_request",
});
PurchaseOrder.belongsTo(MasterVendor, {
  foreignKey: "id_vendor",
  as: "vendor",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_request",
  as: "purchase_orders_request",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_create",
  as: "purchase_orders_create",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_approve_kabag",
  as: "purchase_orders_approve_kabag",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_approve_kabag",
  as: "user_approve_kabag",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_reject_kabag",
  as: "purchase_orders_reject_kabag",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_reject_kabag",
  as: "user_reject_kabag",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_approve_finance",
  as: "purchase_orders_approve_finance",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_approve_finance",
  as: "user_approve_finance",
});

Users.hasMany(PurchaseOrder, {
  foreignKey: "id_reject_finance",
  as: "purchase_orders_reject_finance",
});
PurchaseOrder.belongsTo(Users, {
  foreignKey: "id_reject_finance",
  as: "user_reject_finance",
});

module.exports = PurchaseOrder;
