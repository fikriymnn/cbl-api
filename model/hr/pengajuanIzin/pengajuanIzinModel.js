const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");

const { DataTypes } = Sequelize;

const PengajuanIzin = db.define(
  "pengajuan_izin",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "USERID",
      },
    },
    id_pengaju: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "USERID",
      },
    },
    id_hr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KaryawanModel,
        key: "USERID",
      },
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
    alasan_izin: {
      type: DataTypes.STRING,
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
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_karyawan",
  as: "izin_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_pengaju",
  as: "pengaju_izin_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_hr",
  as: "hr_respon_izin_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

module.exports = PengajuanIzin;
