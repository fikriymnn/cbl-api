const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const StockOpnameRawmaterialModel = require("./stockOpnameRawMaterialModel");
const GudangRawMaterialBooking = require("../gudangRawMaterialBookingModel");
const GudangRawMaterialStock = require("../gudangRawMaterialStock/gudangRawMaterialStockModel");
const JoModel = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const StockOpnameRawMaterialItem = db.define(
  "rm_stock_opname_raw_material_item",
  {
    id_stock_opname_raw_material: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: StockOpnameRawmaterialModel,
        key: "id",
      },
    },
    id_gudang_raw_material_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangRawMaterialBooking,
        key: "id",
      },
    },
    id_gudang_raw_material_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangRawMaterialBooking,
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
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
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
    nama_item: {
      type: DataTypes.STRING,
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
    sumber_gudang: {
      type: DataTypes.STRING,
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

StockOpnameRawmaterialModel.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_stock_opname_raw_material",
  as: "stock_opname_raw_material_item",
});
StockOpnameRawMaterialItem.belongsTo(StockOpnameRawmaterialModel, {
  foreignKey: "id_stock_opname_raw_material",
  as: "stock_opname",
});

GudangRawMaterialBooking.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_gudang_raw_material_booking",
  as: "stock_opname_raw_material_item",
});
StockOpnameRawMaterialItem.belongsTo(GudangRawMaterialBooking, {
  foreignKey: "id_gudang_raw_material_booking",
  as: "gudang_raw_material_booking",
});

GudangRawMaterialStock.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "stock_opname_raw_material_item",
});
StockOpnameRawMaterialItem.belongsTo(GudangRawMaterialStock, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "gudang_raw_material_stock",
});

JoModel.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_jo",
  as: "stock_opname_raw_material_item_raw_material",
});
StockOpnameRawMaterialItem.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

MasterBarang.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_item",
  as: "stock_opname_raw_material_item_raw_material",
});
StockOpnameRawMaterialItem.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "item",
});

Users.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_user_save",
  as: "stock_opname_raw_material_item_save",
});
StockOpnameRawMaterialItem.belongsTo(Users, {
  foreignKey: "id_user_save",
  as: "user_save",
});

Users.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_user_approve",
  as: "stock_opname_raw_material_item_approve",
});
StockOpnameRawMaterialItem.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
Users.hasMany(StockOpnameRawMaterialItem, {
  foreignKey: "id_user_reject",
  as: "stock_opname_raw_material_item_reject",
});
StockOpnameRawMaterialItem.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});
module.exports = StockOpnameRawMaterialItem;
