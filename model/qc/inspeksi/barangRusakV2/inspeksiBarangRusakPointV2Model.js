const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiBarangRusakV2 = require("./inspeksiBarangRusakV2Model");
const User = require("../../../userModel");

const InspeksiBarangRusakPointV2 = db.define(
  "cs_inspeksi_barang_rusak_point_v2",
  {
    id_inspeksi_barang_rusak_v2: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiBarangRusakV2,
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
    id_inspektor_edit: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
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
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_pengecekan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_defect: {
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

InspeksiBarangRusakV2.hasMany(InspeksiBarangRusakPointV2, {
  foreignKey: "id_inspeksi_barang_rusak_v2",
  as: "inspeksi_barang_rusak_point_v2",
});
InspeksiBarangRusakPointV2.belongsTo(InspeksiBarangRusakV2, {
  foreignKey: "id_inspeksi_barang_rusak_v2",
  as: "inspeksi_barang_rusak_v2",
});

User.hasMany(InspeksiBarangRusakPointV2, {
  foreignKey: "id_inspektor",
});
InspeksiBarangRusakPointV2.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

User.hasMany(InspeksiBarangRusakPointV2, {
  foreignKey: "id_inspektor_edit",
  as: "barang_rusak_inspektor_edit",
});
InspeksiBarangRusakPointV2.belongsTo(User, {
  foreignKey: "id_inspektor_edit",
  as: "inspektor_edit",
});

module.exports = InspeksiBarangRusakPointV2;
