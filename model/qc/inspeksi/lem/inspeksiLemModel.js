const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiLem = db.define(
  "cs_inspeksi_lem",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_pending: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
