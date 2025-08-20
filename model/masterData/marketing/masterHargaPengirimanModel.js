const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterHargaPengiriman = db.define(
  "ms_harga_pengiriman",
  {
    nama_area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    harga: {
      type: DataTypes.FLOAT,
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

module.exports = MasterHargaPengiriman;
