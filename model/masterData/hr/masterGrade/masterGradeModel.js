const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterGrade = db.define(
  "ms_hr_grade",
  {
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lembur_biasa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    lembur_libur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tunjangan_jabatan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    uang_hadir: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    uang_makan_lembur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tunjangan_kopi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tunjangan_kerja_malam: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    uang_dinas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    uang_kawal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    uang_ongkos_pulang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    insentif: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterGrade;
