const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const MasterDivisiModel = require("../../masterData/hr/masterDivisiModel");
const MasterDepartmentModel = require("../../masterData/hr/masterDeprtmentModel");
const MasterBagianHrModel = require("../../masterData/hr/masterBagianModel");

const { DataTypes } = Sequelize;

const KaryawanBiodataModel = db.define(
  "karyawan_biodata",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    nik: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_kelamin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_divisi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterDivisiModel,
        key: "id",
      },
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterDepartmentModel,
        key: "id",
      },
    },
    id_bagian: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBagianHrModel,
        key: "id",
      },
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_masuk: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_keluar: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tipe_penggajian: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_karyawan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_pajak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sub_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sisa_cuti: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    limit_pinjaman: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    kontrak_dari: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    kontrak_sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gaji: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(KaryawanBiodataModel, {
  foreignKey: "id_karyawan",
  as: "biodata_karyawan",
});
KaryawanBiodataModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi divisi
MasterDivisiModel.hasMany(KaryawanBiodataModel, {
  foreignKey: "id_divisi",
  as: "karyawan_divisi",
});
KaryawanBiodataModel.belongsTo(MasterDivisiModel, {
  foreignKey: "id_divisi",
  as: "divisi",
});

//relasi department
MasterDepartmentModel.hasMany(KaryawanBiodataModel, {
  foreignKey: "id_department",
  as: "karyawan_department",
});
KaryawanBiodataModel.belongsTo(MasterDepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

//relasi bagian
MasterBagianHrModel.hasMany(KaryawanBiodataModel, {
  foreignKey: "id_bagian",
  as: "karyawan_bagian",
});
KaryawanBiodataModel.belongsTo(MasterBagianHrModel, {
  foreignKey: "id_bagian",
  as: "bagian",
});

module.exports = KaryawanBiodataModel;
