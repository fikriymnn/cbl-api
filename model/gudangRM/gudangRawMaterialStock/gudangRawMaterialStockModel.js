const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoModel = require("../../marketing/io/ioModel");
const BomPpicModel = require("../../ppic/bomPpic/bomPpicModel");
const SoModel = require("../../marketing/so/soModel");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const GudangRawMaterialStock = db.define(
  "gudang_raw_material_stock",
  {
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    kode_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    tipe_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_masuk: {
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

MasterBarang.hasMany(GudangRawMaterialStock, {
  foreignKey: "id_item",
  as: "gudang_raw_material_stock",
});
GudangRawMaterialStock.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

module.exports = GudangRawMaterialStock;
