const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const KaryawanBiodataModel = require("../karyawan/karyawanBiodataModel");

const { DataTypes } = Sequelize;

const KaryawanBagianMesinModel = db.define(
  "karyawan_bagian_mesin",
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
    id_bagian_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_bagian_mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi karyawan
KaryawanModel.hasMany(KaryawanBagianMesinModel, {
  foreignKey: "id_karyawan",
  as: "bagian_mesin_karyawan",
});
KaryawanBagianMesinModel.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi divisi
KaryawanBiodataModel.hasMany(KaryawanBagianMesinModel, {
  foreignKey: "id_biodata_karyawan",
  as: "bagian_mesin_karyawan",
});
KaryawanBagianMesinModel.belongsTo(KaryawanBiodataModel, {
  foreignKey: "id_biodata_karyawan",
  as: "karyawan_biodata",
});

module.exports = KaryawanBagianMesinModel;
