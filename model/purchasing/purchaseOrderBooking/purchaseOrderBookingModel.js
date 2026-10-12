const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// PO booking: sama seperti purchase order tapi tanpa items_jo (hanya items),
// barang yang datang masuk ke gudang stock semua
const PurchaseOrderBooking = db.define(
  "purchase_order_booking",
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
    id_close_po: {
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note_supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchase_name: {
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
    status_po: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "progress",
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

MasterVendor.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_vendor",
  as: "purchase_order_booking",
});
PurchaseOrderBooking.belongsTo(MasterVendor, {
  foreignKey: "id_vendor",
  as: "vendor",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_request",
  as: "purchase_order_booking_request",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_create",
  as: "purchase_order_booking_create",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_approve_kabag",
  as: "purchase_order_booking_approve_kabag",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_approve_kabag",
  as: "user_approve_kabag",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_reject_kabag",
  as: "purchase_order_booking_reject_kabag",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_reject_kabag",
  as: "user_reject_kabag",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_approve_finance",
  as: "purchase_order_booking_approve_finance",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_approve_finance",
  as: "user_approve_finance",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_reject_finance",
  as: "purchase_order_booking_reject_finance",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_reject_finance",
  as: "user_reject_finance",
});

Users.hasMany(PurchaseOrderBooking, {
  foreignKey: "id_close_po",
  as: "purchase_order_booking_close_po",
});
PurchaseOrderBooking.belongsTo(Users, {
  foreignKey: "id_close_po",
  as: "user_close_po",
});

module.exports = PurchaseOrderBooking;
