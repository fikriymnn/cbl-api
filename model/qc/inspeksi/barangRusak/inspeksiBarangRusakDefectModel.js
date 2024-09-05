const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiBarangRusak = require("./inspeksiBarangRusakModel");
const User = require("../../../userModel");

const InspeksiBarangRusakDefect = db.define(
  "cs_inspeksi_barang_rusak_defect",
  {
    id_inspeksi_barang_rusak: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiBarangRusak,
        key: "id",
      },
    },
    id_inspektor: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    asal_temuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    setting_awal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    druk_awal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sub_total: {
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
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiBarangRusak.hasMany(InspeksiBarangRusakDefect, {
  foreignKey: "id_inspeksi_barang_rusak",
  as: "inspeksi_barang_rusak_defect",
});
InspeksiBarangRusakDefect.belongsTo(InspeksiBarangRusak, {
  foreignKey: "id_inspeksi_barang_rusak",
  as: "inspeksi_barang_rusak",
});

User.hasMany(InspeksiBarangRusakDefect, {
  foreignKey: "id_inspektor",
});
InspeksiBarangRusakDefect.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiBarangRusakDefect;
