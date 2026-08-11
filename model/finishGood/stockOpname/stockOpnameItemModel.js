const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const StockOpnameModel = require("./stockOpnameModel");
const GudangFinishGood = require("../gudangFinishGoodModel");
const JoModel = require("../../ppic/jobOrder/jobOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const SoModel = require("../../marketing/so/soModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const FgStockOpnameItem = db.define(
  "fg_stock_opname_item",
  {
    id_stock_opname: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: StockOpnameModel,
        key: "id",
      },
    },
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
    id_user_save: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_reject: {
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
    jumlah_qty_real: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_masuk: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    type_opname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_create: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    tgl_respon: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_approve: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_reject: {
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

StockOpnameModel.hasMany(FgStockOpnameItem, {
  foreignKey: "id_stock_opname",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(StockOpnameModel, {
  foreignKey: "id_stock_opname",
  as: "stock_opname",
});

GudangFinishGood.hasMany(FgStockOpnameItem, {
  foreignKey: "id_gudang_finish_good",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(GudangFinishGood, {
  foreignKey: "id_gudang_finish_good",
  as: "gudang_finish_good",
});

JoModel.hasMany(FgStockOpnameItem, {
  foreignKey: "id_jo",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(FgStockOpnameItem, {
  foreignKey: "id_io",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(FgStockOpnameItem, {
  foreignKey: "id_so",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(FgStockOpnameItem, {
  foreignKey: "id_customer",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(FgStockOpnameItem, {
  foreignKey: "id_produk",
  as: "stock_opname_item",
});
FgStockOpnameItem.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(FgStockOpnameItem, {
  foreignKey: "id_user_save",
  as: "stock_opname_item_save",
});
FgStockOpnameItem.belongsTo(Users, {
  foreignKey: "id_user_save",
  as: "user_save",
});

Users.hasMany(FgStockOpnameItem, {
  foreignKey: "id_user_approve",
  as: "stock_opname_item_approve",
});
FgStockOpnameItem.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
Users.hasMany(FgStockOpnameItem, {
  foreignKey: "id_user_reject",
  as: "stock_opname_item_reject",
});
FgStockOpnameItem.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});
module.exports = FgStockOpnameItem;
