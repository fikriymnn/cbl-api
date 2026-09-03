const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const GudangRawMaterialStock = require("./gudangRawMaterialStockModel");
const JoModel = require("../../ppic/jobOrder/jobOrderModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

//mutasi khusus gudang stock
const GudangRawMaterialStockMutasi = db.define(
  "gudang_raw_material_stock_mutasi",
  {
    id_gudang_raw_material_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangRawMaterialStock,
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
    id_jo_booking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
        key: "id",
      },
    },
    kode_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo_booking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    //type mutasi untuk keluar dan masuk
    type_mutasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    //untuk mengetahui sumber mutasi barang finish good (adjust stock, normal (alur masuk keluar biasa), idle, stock opname,tambah bahan)
    sumber_mutasi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "normal",
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_mutasi: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
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

GudangRawMaterialStock.hasMany(GudangRawMaterialStockMutasi, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "gudang_raw_material_stock_mutasi",
});
GudangRawMaterialStockMutasi.belongsTo(GudangRawMaterialStock, {
  foreignKey: "id_gudang_raw_material_stock",
  as: "gudang_raw_material_stock",
});

JoModel.hasMany(GudangRawMaterialStockMutasi, {
  foreignKey: "id_jo_booking",
  as: "gudang_raw_material_stock_mutasi",
});
GudangRawMaterialStockMutasi.belongsTo(JoModel, {
  foreignKey: "id_jo_booking",
  as: "jo_booking",
});

MasterBarang.hasMany(GudangRawMaterialStockMutasi, {
  foreignKey: "id_item",
  as: "gudang_raw_material_stock_mutasi",
});
GudangRawMaterialStockMutasi.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

Users.hasMany(GudangRawMaterialStockMutasi, {
  foreignKey: "id_user",
  as: "gudang_raw_material_stock_mutasi",
});
GudangRawMaterialStockMutasi.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = GudangRawMaterialStockMutasi;
