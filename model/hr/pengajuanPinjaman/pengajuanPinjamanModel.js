const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const DepartmentModel = require("../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const PengajuanPinjaman = db.define(
  "pengajuan_pinjaman",
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
    jumlah_pinjaman: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_cicilan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tempo_cicilan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sisa_tempo_cicilan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sisa_pinjaman: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipe_cicilan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jaminan_pinjaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keperluan_pinjaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sumber_pinjaman: {
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
    status_pinjaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(PengajuanPinjaman, {
  foreignKey: "id_karyawan",
  as: "pinjaman_karyawan",
});
PengajuanPinjaman.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanModel.hasMany(PengajuanPinjaman, {
  foreignKey: "id_pengaju",
  as: "pengaju_pinjaman_karyawan",
});
PengajuanPinjaman.belongsTo(KaryawanModel, {
  foreignKey: "id_pengaju",
  as: "karyawan_pengaju",
});

//relasi karyawan hr
KaryawanModel.hasMany(PengajuanPinjaman, {
  foreignKey: "id_hr",
  as: "hr_respon_pinjaman_karyawan",
});
PengajuanPinjaman.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});
//relasi master department
DepartmentModel.hasMany(PengajuanPinjaman, {
  foreignKey: "id_department",
  as: "hr_pengajuan_pinjaman",
});
PengajuanPinjaman.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = PengajuanPinjaman;
