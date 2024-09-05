const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiBarangRusak = db.define(
  "cs_inspeksi_barang_rusak",
  {
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    waktu_sortir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qty_rusak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_pending: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

module.exports = InspeksiBarangRusak;
