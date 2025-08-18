const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterCustomer = db.define(
  "ms_customer",
  {
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_kantor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_gudang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toleransi_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    top_faktur: {
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

module.exports = MasterCustomer;
