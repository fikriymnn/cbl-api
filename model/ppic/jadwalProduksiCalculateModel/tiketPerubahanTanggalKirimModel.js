const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const TiketJadwalProduksi = require("./tiketJadwalProduksiModel");

const { DataTypes } = Sequelize;

const PerubahanTanggalKirim = db.define(
  "tiket_perubahan_tgl_kirim_jadwal_produksi",
  {
    id_tiket_jadwal_produksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TiketJadwalProduksi,
        key: "id",
      },
    },
    no_booking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_approval: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    from_tgl: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    to_tgl: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi tiket
TiketJadwalProduksi.hasMany(PerubahanTanggalKirim, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "tanggal_perubahan",
});
PerubahanTanggalKirim.belongsTo(TiketJadwalProduksi, {
  foreignKey: "id_tiket_jadwal_produksi",
  as: "tiket",
});

module.exports = PerubahanTanggalKirim;
