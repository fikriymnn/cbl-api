const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiPotong = db.define(
  "cs_inspeksi_cetak",
  {
    tanggal: {
      type: DataTypes.STRING,
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
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_druk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_gramatur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warna_depan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warna_belakang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
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
