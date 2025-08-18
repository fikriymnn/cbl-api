const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterKaryawan = require("../../hr/karyawanModel");

const { DataTypes } = Sequelize;

const MasterMarketing = db.define(
  "ms_marketing",
  {
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKaryawan,
        key: "userid",
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterKaryawan.hasMany(MasterMarketing, {
  foreignKey: "id_karyawan",
});
MasterMarketing.belongsTo(MasterKaryawan, {
  foreignKey: "id_karyawan",
  as: "data_karyawan",
});

module.exports = MasterMarketing;
