const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

// Log perubahan hasil calculate tiket jadwal produksi oleh PPIC
// (geser jadwal / ubah kapasitas / ubah drying time).
const TiketJadwalProduksiAdjustLog = db.define(
  "tiket_jadwal_produksi_adjust_log",
  {
    id_tiket_jadwal_produksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // tahapan yang diubah langsung oleh PPIC
    id_tiket_jadwal_produksi_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // geser | ubah_kapasitas | ubah_drying | ubah_kapasitas_drying
    jenis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // mulai_tetap | selesai_tetap (hanya untuk ubah parameter)
    mode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // JSON string
    nilai_lama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nilai_baru: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tahapan_ikut: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alasan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = TiketJadwalProduksiAdjustLog;
