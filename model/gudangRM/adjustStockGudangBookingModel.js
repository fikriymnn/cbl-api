const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const GudangRawmaterialBooking = require("./gudangRawMaterialBookingModel");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterBarang = require("../masterData/barang/masterBarangModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const AdjustStockGudangBooking = db.define(
  "adjust_stock_raw_material_booking",
  {
    id_gudang_raw_material_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangRawmaterialBooking,
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
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
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
    nama_item: {
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
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
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

GudangRawmaterialBooking.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_gudang_raw_material_booking",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(GudangRawmaterialBooking, {
  foreignKey: "id_gudang_raw_material_booking",
  as: "gudang_raw_material_booking",
});

MasterBarang.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_item",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "item",
});

JoModel.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_jo",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_io",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(AdjustStockGudangBooking, {
  foreignKey: "id_so",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_customer",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_produk",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(AdjustStockGudangBooking, {
  foreignKey: "id_user",
  as: "adjust_stock_raw_material_booking",
});
AdjustStockGudangBooking.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = AdjustStockGudangBooking;
