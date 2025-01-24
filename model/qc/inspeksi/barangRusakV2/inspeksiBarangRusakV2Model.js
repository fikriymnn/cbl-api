const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const User = require("../../../userModel");

const InspeksiBarangRusakV2 = db.define(
  "cs_inspeksi_barang_rusak_v2",
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
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    waktu_sortir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai_sortir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_istirahat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_masuk_istirahat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_istirahat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    qty_rusak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    barang_baik_aktual: {
      type: DataTypes.INTEGER,
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
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    catatan: {
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
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(InspeksiBarangRusakV2, {
  foreignKey: "id_inspektor",
});
InspeksiBarangRusakV2.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiBarangRusakV2;
