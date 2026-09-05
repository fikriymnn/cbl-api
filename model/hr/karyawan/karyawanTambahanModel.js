const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("../karyawan/karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanTambahanModel = db.define(
  "karyawan_tambahan",
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
    nama_tambahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_tambahan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  },
);

//relasi karyawan
KaryawanModel.hasMany(KaryawanTambahanModel, {
  foreignKey: "id_karyawan",
  as: "tambahan_karyawan",
});
KaryawanTambahanModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi divisi
KaryawanBiodataModel.hasMany(KaryawanTambahanModel, {
  foreignKey: "id_biodata_karyawan",
  as: "tambahan_karyawan",
});
KaryawanTambahanModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanTambahanModel;
