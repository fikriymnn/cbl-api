const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const JoDoneModel = require("../produksi/produksiJoDoneModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const IncomingBarangJadi = db.define(
  "incoming_barang_jadi",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
        key: "id",
      },
    },
    id_jo_done: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoDoneModel,
        key: "id",
      },
    },
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
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
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
    po_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    toleransi_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_user: {
      type: DataTypes.STRING,
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
  },
);

JoModel.hasMany(IncomingBarangJadi, {
  foreignKey: "id_jo",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

JoDoneModel.hasMany(IncomingBarangJadi, {
  foreignKey: "id_jo_done",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(JoDoneModel, {
  foreignKey: "id_jo_done",
  as: "jo_done",
});

IoModel.hasMany(IncomingBarangJadi, {
  foreignKey: "id_io",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(IncomingBarangJadi, {
  foreignKey: "id_so",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(IncomingBarangJadi, {
  foreignKey: "id_customer",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(IncomingBarangJadi, {
  foreignKey: "id_produk",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(IncomingBarangJadi, {
  foreignKey: "id_user",
  as: "incoming_barang_jadi",
});
IncomingBarangJadi.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = IncomingBarangJadi;
