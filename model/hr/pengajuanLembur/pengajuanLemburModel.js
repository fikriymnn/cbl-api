const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const PengajuanLembur = db.define(
  "pengajuan_lembur",
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
    jo_lembur: {
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
    lama_lembur: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    lama_lembur_aktual: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    alasan_lembur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_lembur: {
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
    status_ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "none",
    },
    catatan_ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alasan_ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lama_lembur_absen: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    type_ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    penanganan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(PengajuanLembur, {
  foreignKey: "id_karyawan",
  as: "lembur_karyawan",
});
PengajuanLembur.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanLembur, {
  foreignKey: "id_pengaju",
  as: "pengaju_lembur_karyawan",
});
PengajuanLembur.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanLembur, {
  foreignKey: "id_hr",
  as: "hr_respon_lembur_karyawan",
});
PengajuanLembur.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi master department
DepartmentModel.hasMany(PengajuanLembur, {
  foreignKey: "id_department",
  as: "hr_pengajuan_lembur",
});
PengajuanLembur.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = PengajuanLembur;
