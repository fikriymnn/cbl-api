const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterKendaraan = db.define(
  "ms_kendaraan",
  {
    nomor_kendaraan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_kendaraan: {
      type: DataTypes.STRING,
      allowNull: true,
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

module.exports = MasterKendaraan;
