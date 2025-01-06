const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PengajuanPromosiStatusKaryawanModel = require("./pengajuanPromosiStatusKaryawanModel");

const { DataTypes } = Sequelize;

const PengajuanPromosiStatusKaryawanPenilaian = db.define(
  "pengajuan_promosi_status_karyawan_penilaian",
  {
    id_pengajuan_promosi_status_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PengajuanPromosiStatusKaryawanModel,
        key: "id",
      },
    },

    nama_point: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_penilaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    point_penilaian: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
PengajuanPromosiStatusKaryawanModel.hasMany(
  PengajuanPromosiStatusKaryawanPenilaian,
  {
    foreignKey: "id_pengajuan_promosi_status_karyawan",
    as: "penilaian",
  }
);
PengajuanPromosiStatusKaryawanPenilaian.belongsTo(
  PengajuanPromosiStatusKaryawanModel,
  {
    foreignKey: "id_pengajuan_promosi_status_karyawan",
    as: "pengajuan",
  }
);

module.exports = PengajuanPromosiStatusKaryawanPenilaian;
