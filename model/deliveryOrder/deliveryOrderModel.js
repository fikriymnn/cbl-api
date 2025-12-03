const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const DeliveryOrder = db.define(
  "delivery_order",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
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
    toleransi_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_pengiriman: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pack_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pack_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pack_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isi_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isi_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isi_3: {
      type: DataTypes.FLOAT,
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

JoModel.hasMany(DeliveryOrder, {
  foreignKey: "id_jo",
  as: "delivery_order",
});
DeliveryOrder.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(DeliveryOrder, {
  foreignKey: "id_io",
  as: "delivery_order",
});
DeliveryOrder.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(DeliveryOrder, {
  foreignKey: "id_so",
  as: "delivery_order",
});
DeliveryOrder.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(DeliveryOrder, {
  foreignKey: "id_customer",
  as: "delivery_order",
});
DeliveryOrder.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(DeliveryOrder, {
  foreignKey: "id_produk",
  as: "delivery_order",
});
DeliveryOrder.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});
module.exports = DeliveryOrder;
