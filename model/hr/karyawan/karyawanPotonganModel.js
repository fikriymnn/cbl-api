const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("../karyawan/karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanPotonganModel = db.define(
  "karyawan_potongan",
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
    nama_potongan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_potongan: {
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
KaryawanModel.hasMany(KaryawanPotonganModel, {
  foreignKey: "id_karyawan",
  as: "potongan_karyawan",
});
KaryawanPotonganModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi divisi
KaryawanBiodataModel.hasMany(KaryawanPotonganModel, {
  foreignKey: "id_biodata_karyawan",
  as: "potongan_karyawan",
});
KaryawanPotonganModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanPotonganModel;
