const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const BookingJadwal = db.define(
  "booking_jadwal",
  {
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty_pcs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty_druk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = BookingJadwal;
