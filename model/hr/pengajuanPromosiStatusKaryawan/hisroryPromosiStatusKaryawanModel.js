const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("../karyawan/karyawanBiodataModel");
const PengajuanPromosiStatusKaryawan = require("./pengajuanPromosiStatusKaryawanModel");
const MasterStatusKaryawan = require("../../masterData/hr/masterStatusKaryawanModel");

const { DataTypes } = Sequelize;

const HistoriStatusKaryawan = db.define(
  "histori_promosi_status_karyawan",
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
    id_pengajuan_promosi_status_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PengajuanPromosiStatusKaryawan,
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
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(HistoriStatusKaryawan, {
  foreignKey: "id_karyawan",
  as: "histori_promosi_status_karyawan",
});
HistoriStatusKaryawan.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan pengaju
KaryawanBiodataModel.hasMany(HistoriStatusKaryawan, {
  foreignKey: "id_biodata_karyawan",
  as: "histori_promosi_status_karyawan",
});
HistoriStatusKaryawan.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

//relasi pengajuan promosi status karyawan
PengajuanPromosiStatusKaryawan.hasMany(HistoriStatusKaryawan, {
  foreignKey: "id_pengajuan_promosi_status_karyawan",
  as: "histori_pengajuan_promosi",
});
HistoriStatusKaryawan.belongsTo(PengajuanPromosiStatusKaryawan, {
  foreignKey: "id_pengajuan_promosi_status_karyawan",
  as: "pengajuan_promosi",
});
//relasi master status karyawan
MasterStatusKaryawan.hasMany(HistoriStatusKaryawan, {
  foreignKey: "id_status_karyawan_awal",
  as: "histori_status_karyawan_awal",
});
HistoriStatusKaryawan.belongsTo(MasterStatusKaryawan, {
  foreignKey: "id_status_karyawan_awal",
  as: "status_karyawan_awal",
});

//relasi master status karyawan
MasterStatusKaryawan.hasMany(HistoriStatusKaryawan, {
  foreignKey: "id_status_karyawan_pengajuan",
  as: "histori_status_karyawan_pengajuan",
});
HistoriStatusKaryawan.belongsTo(MasterStatusKaryawan, {
  foreignKey: "id_status_karyawan_pengajuan",
  as: "status_karyawan_pengajuan",
});

module.exports = HistoriStatusKaryawan;
