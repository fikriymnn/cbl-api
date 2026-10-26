const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const InformasiKurangQty = db.define(
  "informasi_kurang_qty",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
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
    id_mesin_cetak: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
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
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_po: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_kurang: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nama_mesin_cetak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_cetak: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jenis_kerusakan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
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
    indexes: [
      { name: "idx_ikqty_id_jo", fields: ["id_jo"] },
      { name: "idx_ikqty_id_produk", fields: ["id_produk"] },
      { name: "idx_ikqty_id_mesin_cetak", fields: ["id_mesin_cetak"] },
      { name: "idx_ikqty_tgl_cetak", fields: ["tgl_cetak"] },
      { name: "idx_ikqty_is_active", fields: ["is_active"] },
    ],
  },
);

JoModel.hasMany(InformasiKurangQty, {
  foreignKey: "id_jo",
  as: "informasi_kurang_qty",
});
InformasiKurangQty.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

MasterProduk.hasMany(InformasiKurangQty, {
  foreignKey: "id_produk",
  as: "informasi_kurang_qty",
});
InformasiKurangQty.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

MasterMesinTahapan.hasMany(InformasiKurangQty, {
  foreignKey: "id_mesin_cetak",
  as: "informasi_kurang_qty",
});
InformasiKurangQty.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_cetak",
  as: "mesin_cetak",
});

Users.hasMany(InformasiKurangQty, {
  foreignKey: "id_create",
  as: "informasi_kurang_qty_create",
});
InformasiKurangQty.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

module.exports = InformasiKurangQty;
