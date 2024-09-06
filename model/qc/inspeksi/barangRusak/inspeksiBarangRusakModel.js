const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const User = require("../../../userModel");

const InspeksiBarangRusak = db.define(
  "cs_inspeksi_barang_rusak",
  {
    id_inspektor: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.DATE,
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
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    waktu_sortir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai_sortir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qty_rusak: {
      type: DataTypes.INTEGER,
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
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

User.hasMany(InspeksiBarangRusak, {
  foreignKey: "id_inspektor",
});
InspeksiBarangRusak.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiBarangRusak;
