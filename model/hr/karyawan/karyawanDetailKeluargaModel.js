const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("./karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanDetailKeluargaModel = db.define(
  "karyawan_detail_keluarga",
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
    status_kawin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_tanggungan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_pasangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tempat_lahir_pasangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_lahir_pasangan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pendidikan_pasangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pekerjaan_pasangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_ayah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tempat_lahir_ayah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_lahir_ayah: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pendidikan_ayah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pekerjaan_ayah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_ibu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tempat_lahir_ibu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_lahir_ibu: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pendidikan_ibu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pekerjaan_ibu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

KaryawanModel.hasOne(KaryawanDetailKeluargaModel, {
  foreignKey: "id_karyawan",
  as: "detail_keluarga",
});
KaryawanDetailKeluargaModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

KaryawanBiodataModel.hasOne(KaryawanDetailKeluargaModel, {
  foreignKey: "id_biodata_karyawan",
  as: "detail_keluarga",
});

KaryawanDetailKeluargaModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanDetailKeluargaModel;
