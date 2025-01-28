const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiBarangRusakV2 = require("./inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("./inspeksiBarangRusakPointV2Model");
const User = require("../../../userModel");

const InspeksiBarangRusakDefectV2 = db.define(
  "cs_inspeksi_barang_rusak_defect_v2",
  {
    id_inspeksi_barang_rusak_v2: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiBarangRusakV2,
        key: "id",
      },
    },
    id_inspeksi_barang_rusak_point_v2: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiBarangRusakPointV2,
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
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masalah_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    asal_temuan: {
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

InspeksiBarangRusakV2.hasMany(InspeksiBarangRusakDefectV2, {
  foreignKey: "id_inspeksi_barang_rusak_v2",
  as: "inspeksi_barang_rusak_defect_v2",
});
InspeksiBarangRusakDefectV2.belongsTo(InspeksiBarangRusakV2, {
  foreignKey: "id_inspeksi_barang_rusak_v2",
  as: "inspeksi_barang_rusak_v2",
});

InspeksiBarangRusakPointV2.hasMany(InspeksiBarangRusakDefectV2, {
  foreignKey: "id_inspeksi_barang_rusak_point_v2",
  as: "inspeksi_barang_rusak_defect_v2",
});
InspeksiBarangRusakDefectV2.belongsTo(InspeksiBarangRusakPointV2, {
  foreignKey: "id_inspeksi_barang_rusak_point_v2",
  as: "inspeksi_barang_rusak_point_v2",
});

module.exports = InspeksiBarangRusakDefectV2;
