const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("./karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanDetailInformasiModel = db.define(
  "karyawan_detail_informasi",
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
    tempat_lahir: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_lahir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    agama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    golongan_darah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kewarganegaraan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_npwp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_npwp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_npwp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_terdaftar_npwp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_ktp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masa_berlaku_ktp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_jamsotek: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sim_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sim_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_jpk_khusus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

KaryawanModel.hasOne(KaryawanDetailInformasiModel, {
  foreignKey: "id_karyawan",
  as: "detail_informasi",
});
KaryawanDetailInformasiModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

KaryawanBiodataModel.hasOne(KaryawanDetailInformasiModel, {
  foreignKey: "id_biodata_karyawan",
  as: "detail_informasi",
});

KaryawanDetailInformasiModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanDetailInformasiModel;
