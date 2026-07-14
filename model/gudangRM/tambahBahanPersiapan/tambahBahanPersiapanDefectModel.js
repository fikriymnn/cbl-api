const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const TambahBahanPerisapan = require("./tambahBahanPersiapanModel");
const MasterKodeProduksi = require("../../masterData/kodeProduksi/masterKodeProduksiModel");

const { DataTypes } = Sequelize;

const TambahBahanPersiapanDefect = db.define(
  "tambah_bahan_persiapan_defect",
  {
    id_tambah_bahan_persiapan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TambahBahanPerisapan,
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

TambahBahanPerisapan.hasMany(TambahBahanPersiapanDefect, {
  foreignKey: "id_tambah_bahan_persiapan",
  as: "tambah_bahan_persiapan_defect",
});
TambahBahanPersiapanDefect.belongsTo(TambahBahanPerisapan, {
  foreignKey: "id_tambah_bahan_persiapan",
  as: "tambah_bahan_persiapan",
});

module.exports = TambahBahanPersiapanDefect;
