const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const TambahBahanPemakaian = require("./tambahBahanPemakaianModel");
const MasterKodeProduksi = require("../../masterData/kodeProduksi/masterKodeProduksiModel");

const { DataTypes } = Sequelize;

const TambahBahanPemakaianDefect = db.define(
  "tambah_bahan_pemakaian_defect",
  {
    id_tambah_bahan_pemakaian: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TambahBahanPemakaian,
        key: "id",
      },
    },
    id_kode_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_tambah_bahan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
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

TambahBahanPemakaian.hasMany(TambahBahanPemakaianDefect, {
  foreignKey: "id_tambah_bahan_pemakaian",
  as: "tambah_bahan_pemakaian_defect",
});
TambahBahanPemakaianDefect.belongsTo(TambahBahanPemakaian, {
  foreignKey: "id_tambah_bahan_pemakaian",
  as: "tambah_bahan_pemakaian",
});

module.exports = TambahBahanPemakaianDefect;
