const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterKendaraan = require("../masterData/kendaraan/masterKendaraanModel");
const MasterKaryawan = require("../hr/karyawanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const DeliveryOrderGroup = db.define(
  "delivery_order_group",
  {
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoModel,
        key: "id",
      },
    },
    id_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SoModel,
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
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterProduk,
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
    id_kendaraan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKendaraan,
        key: "id",
      },
    },
    id_supir: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKaryawan,
        key: "userid",
      },
    },
    id_kenek: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKaryawan,
        key: "userid",
      },
    },
    no_do: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_po_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kota: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_do: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    is_tax: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    status: {
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
  }
);

IoModel.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_io",
  as: "delivery_order_group",
});
DeliveryOrderGroup.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(DeliveryOrderGroup, {
  foreignKey: "id_so",
  as: "delivery_order_group",
});
DeliveryOrderGroup.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_customer",
  as: "delivery_order_group",
});
DeliveryOrderGroup.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_produk",
  as: "delivery_order_group",
});
DeliveryOrderGroup.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});
Users.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_create",
  as: "do_group_create",
});
DeliveryOrderGroup.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_approve",
  as: "do_group_approve",
});
DeliveryOrderGroup.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});

MasterKendaraan.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_kendaraan",
  as: "do_group",
});
DeliveryOrderGroup.belongsTo(MasterKendaraan, {
  foreignKey: "id_kendaraan",
  as: "kendaraan",
});

MasterKaryawan.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_supir",
  as: "do_group_supir",
});
DeliveryOrderGroup.belongsTo(MasterKaryawan, {
  foreignKey: "id_supir",
  as: "supir",
});

MasterKaryawan.hasMany(DeliveryOrderGroup, {
  foreignKey: "id_kenek",
  as: "do_group_kenek",
});
DeliveryOrderGroup.belongsTo(MasterKaryawan, {
  foreignKey: "id_kenek",
  as: "kenek",
});
module.exports = DeliveryOrderGroup;
