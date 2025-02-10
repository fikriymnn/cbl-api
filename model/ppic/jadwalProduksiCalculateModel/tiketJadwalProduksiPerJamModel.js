const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const TiketJadwalProduksi = require("./tiketJadwalProduksiModel");
const TiketJadwalProduksitahapan = require("./tiketJadwalProduksiTahapanModel");

const { DataTypes } = Sequelize;

const JadwalProduksiPerJam = db.define(
  "tiket_jadwal_produksi_per_jam",
  {
    id_tiket_jadwal_produksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TiketJadwalProduksi,
        key: "id",
      },
    },
    id_tiket_jadwal_produksi_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TiketJadwalProduksitahapan,
        key: "id",
      },
    },
    item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_druk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tahapan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tahapan_ke: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: true,
    },
    jam: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi tiket
TiketJadwalProduksi.hasMany(JadwalProduksiPerJam, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "jadwal_per_jam",
});
JadwalProduksiPerJam.belongsTo(TiketJadwalProduksi, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "tiket",
});

//relasi tahap
TiketJadwalProduksitahapan.hasMany(JadwalProduksiPerJam, {
  foreignKey: "id_tiket_jadwal_produksi_tahapan",
  as: "jadwal_per_jam",
});
JadwalProduksiPerJam.belongsTo(TiketJadwalProduksitahapan, {
  foreignKey: "id_tiket_jadwal_produksi_tahapan",
  as: "tahap",
});

module.exports = JadwalProduksiPerJam;
