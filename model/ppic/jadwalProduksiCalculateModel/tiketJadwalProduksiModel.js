const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const TiketJadwalProduksi = db.define(
  "tiket_jadwal_produksi",
  {
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_booking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_bahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "jadwal",
    },
    tgl_kirim: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tgl_kirim_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tgl_kirim_update: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_kirim_update_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_so_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_cetak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_masuk_jadwal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qty_po: {
      type: DataTypes.INTEGER,
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
    qty_lp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "non calculated",
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = TiketJadwalProduksi;
