const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const JabatanModel = require("../../masterData/hr/masterJabatanModel");

const { DataTypes } = Sequelize;

const PengajuanKaryawan = db.define(
  "pengajuan_karyawan",
  {
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
    untuk_id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DepartmentModel,
        key: "id",
      },
    },
    untuk_id_jabatan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JabatanModel,
        key: "id",
      },
    },
    untuk_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    untuk_jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_dibutuhkan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    jenis_kelamin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pendidikan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pengalaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    syarat_khusus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    diajukan_tanggal: {
      type: DataTypes.DATE,
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

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanKaryawan, {
  foreignKey: "id_pengaju",
  as: "pengaju_karyawan",
});
PengajuanKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanKaryawan, {
  foreignKey: "id_hr",
  as: "hr_respon_pengajuan_karyawan",
});
PengajuanKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi master department
DepartmentModel.hasMany(PengajuanKaryawan, {
  foreignKey: "untuk_id_department",
  as: "hr_pengajuan_karyawan_department",
});
PengajuanKaryawan.belongsTo(DepartmentModel, {
  foreignKey: "untuk_id_department",
  as: "department",
});

//relasi master jabatan
JabatanModel.hasMany(PengajuanKaryawan, {
  foreignKey: "untuk_id_jabatan",
  as: "hr_pengajuan_karyawan_jabatan",
});
PengajuanKaryawan.belongsTo(JabatanModel, {
  foreignKey: "untuk_id_jabatan",
  as: "jabatan",
});

module.exports = PengajuanKaryawan;
