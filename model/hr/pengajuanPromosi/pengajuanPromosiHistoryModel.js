const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("../karyawan/karyawanBiodataModel");
const PengajuanPromosi = require("./pengajuanPromosiModel");
const MasterStatusKaryawan = require("../../masterData/hr/masterStatusKaryawanModel");

const { DataTypes } = Sequelize;

const HistoriPromosi = db.define(
  "histori_promosi",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_biodata_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanBiodataModel,
        key: "id",
      },
    },
    id_pengajuan_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PengajuanPromosi,
        key: "id",
      },
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
    department_promosi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan_promosi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    divisi_promosi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade_promosi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gaji_promosi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(HistoriPromosi, {
  foreignKey: "id_karyawan",
  as: "histori_promosi",
});
HistoriPromosi.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanBiodataModel.hasMany(HistoriPromosi, {
  foreignKey: "id_biodata_karyawan",
  as: "histori_promosi",
});
HistoriPromosi.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

//relasi pengajuan promosi status karyawan
PengajuanPromosi.hasMany(HistoriPromosi, {
  foreignKey: "id_pengajuan_promosi",
  as: "histori_pengajuan_promosi",
});
HistoriPromosi.belongsTo(PengajuanPromosi, {
  foreignKey: "id_pengajuan_promosi",
  as: "pengajuan_promosi",
});

module.exports = HistoriPromosi;
