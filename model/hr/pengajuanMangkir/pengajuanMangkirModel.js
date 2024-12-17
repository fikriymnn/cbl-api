const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const PengajuanIzin = db.define(
  "pengajuan_mangkir",
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
    tanggal: {
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

//relasi karyawan
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_karyawan",
  as: "mangkir_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_pengaju",
  as: "pengaju_mangkir_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanIzin, {
  foreignKey: "id_hr",
  as: "hr_respon_mangkir_karyawan",
});
PengajuanIzin.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi master department
DepartmentModel.hasMany(PengajuanIzin, {
  foreignKey: "id_department",
  as: "hr_pengajuan_mangkir",
});
PengajuanIzin.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = PengajuanIzin;
