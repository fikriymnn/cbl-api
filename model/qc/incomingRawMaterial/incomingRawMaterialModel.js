const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrder = require("../../purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItemJo = require("../../purchasing/purchaseOrder/purchaseOrderItemJoModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const IncomingRawMaterial = db.define(
  "incoming_raw_material",
  {
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    id_purchase_order_item_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrderItemJo,
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
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_good_receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_incoming: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_idle: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_pallet: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    tgl_request: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    tgl_action: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
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

PurchaseOrder.hasMany(IncomingRawMaterial, {
  foreignKey: "id_purchase_order",
  as: "incoming_raw_material",
});
IncomingRawMaterial.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

PurchaseOrderItemJo.hasMany(IncomingRawMaterial, {
  foreignKey: "id_purchase_order_item_jo",
  as: "incoming_raw_material",
});
IncomingRawMaterial.belongsTo(PurchaseOrderItemJo, {
  foreignKey: "id_purchase_order_item_jo",
  as: "purchase_order_item_jo",
});

Users.hasMany(IncomingRawMaterial, {
  foreignKey: "id_request",
  as: "incoming_raw_material_request",
});
IncomingRawMaterial.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

Users.hasMany(IncomingRawMaterial, {
  foreignKey: "id_approve",
  as: "incoming_raw_material_approve",
});
IncomingRawMaterial.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});

Users.hasMany(IncomingRawMaterial, {
  foreignKey: "id_reject",
  as: "incoming_raw_material_reject",
});
IncomingRawMaterial.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = IncomingRawMaterial;
