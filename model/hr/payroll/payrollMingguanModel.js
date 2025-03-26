const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const PayrollPeriodeModel = require("./payrollMingguanPeriodeModel");
const DivisiModel = require("../../masterData/hr/masterDivisiModel");
const JabatanModel = require("../../masterData/hr/masterJabatanModel");

const { DataTypes } = Sequelize;

const Payroll = db.define(
  "payroll_mingguan",
  {
    id_payroll_periode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PayrollPeriodeModel,
        key: "id",
      },
    },
    id_karyawan: {
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
    id_divisi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: DivisiModel,
        key: "id",
      },
    },
    id_jabatan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JabatanModel,
        key: "id",
      },
    },
    nama_department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_divisi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    periode_dari: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periode_sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_upah: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    sub_total_upah: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    pengurangan_penambahan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    note_pengurangan_penambahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_potongan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tipe_penggajian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_karyawan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insentif: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(Payroll, {
  foreignKey: "id_karyawan",
  as: "payroll_karyawan",
});
Payroll.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan hr
KaryawanModel.hasMany(Payroll, {
  foreignKey: "id_hr",
  as: "hr_payroll_karyawan",
});
Payroll.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi master department
DepartmentModel.hasMany(Payroll, {
  foreignKey: "id_department",
  as: "payroll_department",
});
Payroll.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

//relasi master divisi
DivisiModel.hasMany(Payroll, {
  foreignKey: "id_divisi",
  as: "payroll_divisi",
});
Payroll.belongsTo(DivisiModel, {
  foreignKey: "id_divisi",
  as: "divisi",
});

//relasi master jabatan
JabatanModel.hasMany(Payroll, {
  foreignKey: "id_jabatan",
  as: "payroll_jabatan",
});
Payroll.belongsTo(JabatanModel, {
  foreignKey: "id_jabatan",
  as: "jabatan",
});

//relasi master department
PayrollPeriodeModel.hasMany(Payroll, {
  foreignKey: "id_payroll_periode",
  as: "payroll_detail",
});
Payroll.belongsTo(PayrollPeriodeModel, {
  foreignKey: "id_payroll_periode",
  as: "payroll_periode",
});

module.exports = Payroll;
