const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("./karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanRiwayatPekerjaanModel = db.define(
  "karyawan_riwayat_pekerjaan",
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
    dari_tahun: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dari_bulan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sampai_tahun: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sampai_bulan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_perusahaan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

KaryawanModel.hasMany(KaryawanRiwayatPekerjaanModel, {
  foreignKey: "id_karyawan",
  as: "riwayat_pekerjaan",
});
KaryawanRiwayatPekerjaanModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

KaryawanBiodataModel.hasMany(KaryawanRiwayatPekerjaanModel, {
  foreignKey: "id_biodata_karyawan",
  as: "riwayat_pekerjaan",
});

KaryawanRiwayatPekerjaanModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanRiwayatPekerjaanModel;
