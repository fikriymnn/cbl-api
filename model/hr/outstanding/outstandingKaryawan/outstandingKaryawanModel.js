const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const KaryawanModel = require("../../karyawanModel");
const DepartmentModel = require("../../../masterData/hr/masterDeprtmentModel");

const { DataTypes } = Sequelize;

const OutstandingAbsen = db.define(
  "outstanding_karyawan",
  {
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_respon: {
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
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
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
KaryawanModel.hasMany(OutstandingAbsen, {
  foreignKey: "id_karyawan",
  as: "outstanding_karyawan",
});
OutstandingAbsen.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi karyawan
KaryawanModel.hasMany(OutstandingAbsen, {
  foreignKey: "id_respon",
  as: "respon_outstanding_karyawan",
});
OutstandingAbsen.belongsTo(KaryawanModel, {
  foreignKey: "id_respon",
  as: "karyawan_respon",
});

//relasi master department
DepartmentModel.hasMany(OutstandingAbsen, {
  foreignKey: "id_department",
  as: "outstanding_karyawan_department",
});
OutstandingAbsen.belongsTo(DepartmentModel, {
  foreignKey: "id_department",
  as: "department",
});

module.exports = OutstandingAbsen;
