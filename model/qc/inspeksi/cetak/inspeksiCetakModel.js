const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiPotong = db.define(
  "cs_inspeksi_cetak",
  {
    tanggal: {
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
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_druk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mata: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_gramatur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warna_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warna_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_pending: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alasan_pending: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiPotong;
