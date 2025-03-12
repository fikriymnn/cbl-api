const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const DivisiModel = require("../../masterData/hr/masterDivisiModel");
const JabatanModel = require("../../masterData/hr/masterJabatanModel");
const GradeHrModel = require("../../masterData/hr/masterGradeModel");

const { DataTypes } = Sequelize;

const PengajuanPromosi = db.define(
  "pengajuan_promosi",
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
    department_pengaju: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan_pengaju: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    divisi_pengaju: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department_awal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan_awal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    divisi_awal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade_awal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gaji_awal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_department_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DepartmentModel,
        key: "id",
      },
    },
    id_jabatan_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JabatanModel,
        key: "id",
      },
    },
    id_divisi_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DivisiModel,
        key: "id",
      },
    },
    id_grade_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GradeHrModel,
        key: "id",
      },
    },
    gaji_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tanggal_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tanggal_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    masa_kerja: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alasan_promosi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan_hr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
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
KaryawanModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_karyawan",
  as: "promosi_karyawan",
});
PengajuanPromosi.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_pengaju",
  as: "pengaju_promosi_karyawan",
});
PengajuanPromosi.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_hr",
  as: "hr_respon_promosi_karyawan",
});
PengajuanPromosi.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});
//relasi master department
DepartmentModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_department_promosi",
  as: "hr_promosi_department",
});
PengajuanPromosi.belongsTo(DepartmentModel, {
  foreignKey: "id_department_promosi",
  as: "department_promosi",
});
//relasi master divisi
DivisiModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_divisi_promosi",
  as: "hr_promosi_divisi",
});
PengajuanPromosi.belongsTo(DivisiModel, {
  foreignKey: "id_divisi_promosi",
  as: "divisi_promosi",
});
//relasi master jabatan
JabatanModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_jabatan_promosi",
  as: "hr_promosi_jabatan",
});
PengajuanPromosi.belongsTo(JabatanModel, {
  foreignKey: "id_jabatan_promosi",
  as: "jabatan_promosi",
});
//relasi master grade
GradeHrModel.hasMany(PengajuanPromosi, {
  foreignKey: "id_grade_promosi",
  as: "hr_promosi_grade",
});
PengajuanPromosi.belongsTo(GradeHrModel, {
  foreignKey: "id_grade_promosi",
  as: "grade_promosi",
});

module.exports = PengajuanPromosi;
