const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const MasterKetentuanInsheet = db.define(
  "ms_ketentuan_insheet",
  {
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batas_bawah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batas_atas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nilai: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    is_persentase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterKetentuanInsheet;
