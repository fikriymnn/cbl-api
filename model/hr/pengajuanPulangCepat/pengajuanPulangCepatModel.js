const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const PengajuanSakit = db.define(
  "pengajuan_pulang_cepat",
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
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DepartmentModel,
        key: "id",
      },
    },
    nama_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    type_izin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jam_pulang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alasan: {
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
KaryawanModel.hasMany(PengajuanSakit, {
  foreignKey: "id_karyawan",
  as: "pulang_cepat_karyawan",
});
PengajuanSakit.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanSakit, {
  foreignKey: "id_pengaju",
  as: "pengaju_pulang_cepat_karyawan",
});
PengajuanSakit.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanSakit, {
  foreignKey: "id_hr",
  as: "hr_respon_pulang_cepat_karyawan",
});
PengajuanSakit.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});
//relasi master department
DepartmentModel.hasMany(PengajuanSakit, {
  foreignKey: "id_department",
  as: "hr_pengajuan_pulang_cepat",
});
PengajuanSakit.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = PengajuanSakit;
