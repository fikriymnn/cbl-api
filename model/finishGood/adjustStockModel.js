const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const GudangFinishGood = require("./gudangFinishGoodModel");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const AdjustStock = db.define(
  "adjust_stock",
  {
    id_gudang_finish_good: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangFinishGood,
        key: "id",
      },
    },
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
    jumlah_qty_awal: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_qty_adjust: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_adjust: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
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

GudangFinishGood.hasMany(AdjustStock, {
  foreignKey: "id_gudang_finish_good",
  as: "adjust_stock",
});
AdjustStock.belongsTo(GudangFinishGood, {
  foreignKey: "id_gudang_finish_good",
  as: "gudang_finish_good",
});

JoModel.hasMany(AdjustStock, {
  foreignKey: "id_jo",
  as: "adjust_stock",
});
AdjustStock.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(AdjustStock, {
  foreignKey: "id_io",
  as: "adjust_stock",
});
AdjustStock.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(AdjustStock, {
  foreignKey: "id_so",
  as: "adjust_stock",
});
AdjustStock.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(AdjustStock, {
  foreignKey: "id_customer",
  as: "adjust_stock",
});
AdjustStock.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(AdjustStock, {
  foreignKey: "id_produk",
  as: "adjust_stock",
});
AdjustStock.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(AdjustStock, {
  foreignKey: "id_user",
  as: "adjust_stock",
});
AdjustStock.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = AdjustStock;
