const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../config/database");
const User = require("../../userModel");
const MasterStatusKalibrasi = require("../../masterData/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurModel");
const MasterLokasiKalibrasi = require("../../masterData/qc/kalibrasiAlatUkur/masterLokasiPenyimpananKalibrasiAlatUkurModel");

const KalibrasiAlatUkur = db.define(
  "kalibrasi_alat_ukur",
  {
    id_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterStatusKalibrasi,
        key: "id",
      },
    },
    id_lokasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterLokasiKalibrasi,
        key: "id",
      },
    },
    nama_alat_ukur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_seri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lokasi_penyimpanan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frekuensi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kalibrasi_terakhir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    masa_berlaku: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sertifikat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_sertifikat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: true,
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
MasterStatusKalibrasi.hasMany(KalibrasiAlatUkur, {
  foreignKey: "id_status",
  as: "kalibrasi_alat_ukur",
});

KalibrasiAlatUkur.belongsTo(MasterStatusKalibrasi, {
  foreignKey: "id_status",
  as: "status_kalibrasi",
});

MasterLokasiKalibrasi.hasMany(KalibrasiAlatUkur, {
  foreignKey: "id_lokasi",
  as: "kalibrasi_alat_ukur",
});

KalibrasiAlatUkur.belongsTo(MasterLokasiKalibrasi, {
  foreignKey: "id_lokasi",
  as: "lokasi_kalibrasi",
});
module.exports = KalibrasiAlatUkur;
