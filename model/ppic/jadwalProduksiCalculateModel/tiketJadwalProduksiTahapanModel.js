const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const TiketJadwalProduksi = require("./tiketJadwalProduksiModel");

const { DataTypes } = Sequelize;

const TiketJadwalProduksitahap = db.define(
  "tiket_jadwal_produksi_tahapan",
  {
    id_tiket_jadwal_produksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TiketJadwalProduksi,
        key: "id",
      },
    },
    item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tahapan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tahapan_ke: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
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
      allowNull: false,
      defaultValue: 0,
    },
    drying_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    setting: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    toleransi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_waktu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_waktu_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tgl_from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_to: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi tiket
TiketJadwalProduksi.hasMany(TiketJadwalProduksitahap, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "tahap",
});
TiketJadwalProduksitahap.belongsTo(TiketJadwalProduksi, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "tiket",
});

module.exports = TiketJadwalProduksitahap;
