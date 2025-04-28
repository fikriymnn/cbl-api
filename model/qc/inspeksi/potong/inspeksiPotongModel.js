const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiPotong = db.define(
  "cs_inspeksi_potong",
  {
    jenis_potong: {
      type: DataTypes.STRING,
      allowNull: true,
    },
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
    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inspector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_skor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_doc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiPotong;
