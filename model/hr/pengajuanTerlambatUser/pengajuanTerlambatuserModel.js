const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const DivisiModel = require("../../masterData/hr/masterDivisiModel");

const { DataTypes } = Sequelize;

const PengajuanTerlambatUser = db.define(
  "pengajuan_terlambat_user",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_atasan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DepartmentModel,
        key: "id",
      },
    },
    id_divisi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DivisiModel,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    alasan_terlambat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lama_terlambat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan_atasan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
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
  },
);

//relasi karyawan
KaryawanModel.hasMany(PengajuanTerlambatUser, {
  foreignKey: "id_karyawan",
  as: "terlambat_karyawan_user",
});
PengajuanTerlambatUser.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanTerlambatUser, {
  foreignKey: "id_atasan",
  as: "pengaju_terlambat_karyawan_user",
});
PengajuanTerlambatUser.belongsTo(KaryawanModel, {
  foreignKey: "id_atasan",
  as: "karyawan_atasan",
});

//relasi master department
DepartmentModel.hasMany(PengajuanTerlambatUser, {
  foreignKey: "id_department",
  as: "hr_pengajuan_terlambat_user",
});
PengajuanTerlambatUser.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

//relasi master divisi
DivisiModel.hasMany(PengajuanTerlambatUser, {
  foreignKey: "id_divisi",
  as: "hr_pengajuan_terlambat_user",
});
PengajuanTerlambatUser.belongsTo(DivisiModel, {
  foreignKey: "id_divisi",
  as: "divisi",
});

module.exports = PengajuanTerlambatUser;
