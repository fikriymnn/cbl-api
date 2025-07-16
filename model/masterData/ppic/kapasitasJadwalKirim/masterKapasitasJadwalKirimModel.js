const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterKapasitasJadwalKirim = db.define(
  "ms_kapasitas_jadwal_kirim",
  {
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cgd: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cgs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isi_dus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterKapasitasJadwalKirim;
