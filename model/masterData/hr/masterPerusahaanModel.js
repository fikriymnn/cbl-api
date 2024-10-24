const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterPerusahaan = db.define(
  "ms_perusahaan",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kelurahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kecamatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kota: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_pos: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    negara: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_tlp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterPerusahaan;
