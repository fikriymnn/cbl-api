const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const MasterStatusKaryawan = require("../../masterData/hr/masterStatusKaryawanModel");

const { DataTypes } = Sequelize;

const PengajuanStatusKaryawan = db.define(
  "pengajuan_promosi_status_karyawan",
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
    id_status_karyawan_awal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterStatusKaryawan,
        key: "id",
      },
    },
    id_status_karyawan_pengajuan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterStatusKaryawan,
        key: "id",
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    divisi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_masuk_kerja: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periode_awal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    periode_akhir: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_alpa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_izin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_tanpa_keterangan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_keterlambatan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    peringatan_ke_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    peringatan_ke_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    peringatan_ke_3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prestasi_kerja: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prestasi_kerja_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kesan_penilai: {
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
KaryawanModel.hasMany(PengajuanStatusKaryawan, {
  foreignKey: "id_karyawan",
  as: "promosi_status_karyawan",
});
PengajuanStatusKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanStatusKaryawan, {
  foreignKey: "id_pengaju",
  as: "pengaju_promosi_status_karyawan",
});
PengajuanStatusKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanStatusKaryawan, {
  foreignKey: "id_hr",
  as: "hr_respon_promosi_status_karyawan",
});
PengajuanStatusKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});
//relasi master department
DepartmentModel.hasMany(PengajuanStatusKaryawan, {
  foreignKey: "id_department",
  as: "hr_promosi_status_karyawan",
});
PengajuanStatusKaryawan.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department_promosi",
});

module.exports = PengajuanStatusKaryawan;
