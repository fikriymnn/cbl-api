const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");

const { DataTypes } = Sequelize;

const PengajuanCuti = db.define(
  "pengajuan_cuti",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_pengaju: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_hr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    tipe_cuti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dari: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jumlah_hari: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alasan_cuti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sisa_cuti: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan_hr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(PengajuanCuti, {
  foreignKey: "id_karyawan",
  as: "cuti_karyawan",
});
PengajuanCuti.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanCuti, {
  foreignKey: "id_pengaju",
  as: "pengaju_cuti_karyawan",
});
PengajuanCuti.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanCuti, {
  foreignKey: "id_hr",
  as: "hr_respon_karyawan",
});
PengajuanCuti.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

module.exports = PengajuanCuti;
