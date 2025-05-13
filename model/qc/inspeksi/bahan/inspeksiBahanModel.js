const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const User = require("../../../userModel");

const InspeksiBahan = db.define(
  "cs_inspeksi_bahan",
  {
    id_inspektor: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_lot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ukuran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inspector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_pallet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hasil_rumus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    verifikasi: {
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
    total_skor: {
      type: DataTypes.INTEGER,
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

User.hasMany(InspeksiBahan, {
  foreignKey: "id_inspektor",
});
InspeksiBahan.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "data_inspektor",
});

module.exports = InspeksiBahan;
