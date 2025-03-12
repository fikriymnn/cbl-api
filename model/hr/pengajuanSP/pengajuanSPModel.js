const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const PengajuanSP = db.define(
  "pengajuan_sp",
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
    dari: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    nama_sp_teguran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    masa_berlaku: {
      type: DataTypes.INTEGER,
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
KaryawanModel.hasMany(PengajuanSP, {
  foreignKey: "id_karyawan",
  as: "sp_karyawan",
});
PengajuanSP.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanSP, {
  foreignKey: "id_pengaju",
  as: "pengaju_sp_karyawan",
});
PengajuanSP.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanSP, {
  foreignKey: "id_hr",
  as: "hr_respon_sp_karyawan",
});
PengajuanSP.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi master department
DepartmentModel.hasMany(PengajuanSP, {
  foreignKey: "id_department",
  as: "hr_pengajuan_sp",
});
PengajuanSP.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = PengajuanSP;
