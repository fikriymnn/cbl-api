const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const JadwalProduksi = db.define(
  "jadwal_produksi",
  {
    item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_booking: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tahapan_ke: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    kategori_drying_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kapasitas_per_jam: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drying_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    setting: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    toleransi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_waktu: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
