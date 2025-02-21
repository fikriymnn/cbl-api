const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiBahan = require("./inspeksiBahanModel");

const InspeksiBahanResult = db.define(
  "cs_inspeksi_bahan_result",
  {
    id_inspeksi_bahan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiBahan,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alat_ukur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_kiri: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_tengah: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_kanan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_rumus_kiri: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_rumus_tengah: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_rumus_kanan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_rata_rata: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_panjang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_lebar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bobot: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    send: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiBahan.hasMany(InspeksiBahanResult, {
  foreignKey: "id_inspeksi_bahan",
  as: "inspeksi_bahan_result",
});
InspeksiBahanResult.belongsTo(InspeksiBahan, {
  foreignKey: "id_inspeksi_bahan",
  as: "inspeksi_bahan_result",
});

module.exports = InspeksiBahanResult;
