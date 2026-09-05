const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrder = require("../purchaseOrder/purchaseOrderModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const RequestCancelPurchaseOrder = db.define(
  "request_cancel_purchase_order",
  {
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
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
    id_respon: {
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    status_ticket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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

PurchaseOrder.hasMany(RequestCancelPurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "request_cancel_purchase_orders",
});
RequestCancelPurchaseOrder.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

Users.hasMany(RequestCancelPurchaseOrder, {
  foreignKey: "id_request",
  as: "request_cancel_purchase_orders",
});
RequestCancelPurchaseOrder.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

Users.hasMany(RequestCancelPurchaseOrder, {
  foreignKey: "id_respon",
  as: "request_cancel_purchase_orders_respon",
});
RequestCancelPurchaseOrder.belongsTo(Users, {
  foreignKey: "id_respon",
  as: "user_respon",
});

module.exports = RequestCancelPurchaseOrder;
