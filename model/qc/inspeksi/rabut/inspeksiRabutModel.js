const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiRabut = db.define(
  "cs_inspeksi_rabut",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_periode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    waktu_check: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiRabut;
