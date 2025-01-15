const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const JadwalProduksi = db.define(
  "jadwal_produksi",
  {
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty_pcs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty_druk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tahapan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori_drying_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kapasitas_per_jam: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    drying_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seting: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toleransi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_waktu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    jam: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = JadwalProduksi;
