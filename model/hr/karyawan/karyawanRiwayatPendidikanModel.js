const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("./karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanRiwayatPendidikanModel = db.define(
  "karyawan_riwayat_pendidikan",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_biodata_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanBiodataModel,
        key: "id",
      },
    },
    tingkat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_sekolah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kota: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jurusan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tahun_lulus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    berijazah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

KaryawanModel.hasMany(KaryawanRiwayatPendidikanModel, {
  foreignKey: "id_karyawan",
  as: "riwayat_pendidikan",
});
KaryawanRiwayatPendidikanModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

KaryawanBiodataModel.hasMany(KaryawanRiwayatPendidikanModel, {
  foreignKey: "id_biodata_karyawan",
  as: "riwayat_pendidikan",
});

KaryawanRiwayatPendidikanModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanRiwayatPendidikanModel;
