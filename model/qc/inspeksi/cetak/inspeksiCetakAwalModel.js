const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetak = require("./inspeksiCetakModel");

const InspeksiCetakAwal = db.define(
  "cs_inspeksi_cetak_awal",
  {
    id_inspeksi_cetak: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCetak,
        key: "id",
      },
    },
    jumlah_periode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    waktu_check: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCetak.hasMany(InspeksiCetakAwal, {
  foreignKey: "id_inspeksi_cetak",
  as: "inspeksi_cetak_awal",
});
InspeksiCetakAwal.belongsTo(InspeksiCetak, {
  foreignKey: "id_inspeksi_cetak",
  as: "inspeksi_cetak",
});

module.exports = InspeksiCetakAwal;