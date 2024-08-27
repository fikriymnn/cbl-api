const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiPond = db.define(
  "cs_inspeksi_pond",
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
    jumlah_druk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumlah_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mata: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_gramatur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ukuran_jadi: {
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
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiPond;
