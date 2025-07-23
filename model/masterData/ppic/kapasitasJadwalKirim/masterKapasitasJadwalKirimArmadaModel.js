const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const MasterKapasitasJadwalKirim = require("./masterKapasitasJadwalKirimModel");

const { DataTypes } = Sequelize;

const MasterKapasitasJadwalKirimArmada = db.define(
  "ms_kapasitas_jadwal_kirim_armada",
  {
    id_kapasitas_jadwal_kirim: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKapasitasJadwalKirim,
        key: "id",
      },
    },
    nama_armada: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_orang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterKapasitasJadwalKirim.hasMany(MasterKapasitasJadwalKirimArmada, {
  foreignKey: "id_kapasitas_jadwal_kirim",
  as: "armada",
});
MasterKapasitasJadwalKirimArmada.belongsTo(MasterKapasitasJadwalKirim, {
  foreignKey: "id_kapasitas_jadwal_kirim",
  as: "kapasitas_jadwal",
});

module.exports = MasterKapasitasJadwalKirimArmada;
