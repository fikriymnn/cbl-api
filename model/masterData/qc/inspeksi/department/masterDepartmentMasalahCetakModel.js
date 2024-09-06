const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../../config/database");

const User = require("../../../../userModel");
const MasterKodeCetakDefect = require("../masterKodeMasalahCetakModel");

const InspeksiMasterCetakDepartmentDefect = db.define(
  "cs_master_inspeksi_cetak_department_defect",
  {
    id_master_kode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKodeCetakDefect,
        key: "id",
      },
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterKodeCetakDefect.hasMany(InspeksiMasterCetakDepartmentDefect, {
  foreignKey: "id_inspeksi_bahan",
  as: "inspeksi_bahan_result",
});

module.exports = InspeksiMasterCetakDepartmentDefect;
