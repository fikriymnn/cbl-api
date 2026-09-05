const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const MasterBarang = require("../masterData/barang/masterBarangModel");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

//mutasi untuk gudang booking dan gudang stock
const MutasiBarangRawMaterial = db.define(
  "mutasi_barang_raw_material",
  {
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
    no_good_receipt: {
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

JoModel.hasMany(MutasiBarangRawMaterial, {
  foreignKey: "id_jo_booking",
  as: "mutasi_barang_raw_material",
});
MutasiBarangRawMaterial.belongsTo(JoModel, {
  foreignKey: "id_jo_booking",
  as: "jo_booking",
});

MasterBarang.hasMany(MutasiBarangRawMaterial, {
  foreignKey: "id_item",
  as: "mutasi_barang_raw_material",
});
MutasiBarangRawMaterial.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

Users.hasMany(MutasiBarangRawMaterial, {
  foreignKey: "id_user",
  as: "mutasi_barang_raw_material",
});
MutasiBarangRawMaterial.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = MutasiBarangRawMaterial;
