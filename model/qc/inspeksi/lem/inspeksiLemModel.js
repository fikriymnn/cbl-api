const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiLem = db.define(
  "cs_inspeksi_lem",
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
    jumlah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jenis_lem: {
      type: DataTypes.STRING,
      allowNull: true,
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

module.exports = InspeksiLem;
