const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../config/database");
const User = require("../../userModel");

const KalibrasiAlatUkur = db.define(
  "kalibrasi_alat_ukur",
  {
    nama_alat_ukur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_seri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lokasi_penyimpanan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frekuensi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kalibrasi_terakhir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    masa_berlaku: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sertifikat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = KalibrasiAlatUkur;
