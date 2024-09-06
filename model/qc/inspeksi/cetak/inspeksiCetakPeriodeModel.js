const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetak = require("./inspeksiCetakModel");

const InspeksiCetakPeriode = db.define(
  "cs_inspeksi_cetak_periode",
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
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCetak.hasMany(InspeksiCetakPeriode, {
  foreignKey: "id_inspeksi_cetak",
  as: "inspeksi_cetak_periode",
});
InspeksiCetakPeriode.belongsTo(InspeksiCetak, {
  foreignKey: "id_inspeksi_cetak",
  as: "inspeksi_cetak",
});

module.exports = InspeksiCetakPeriode;
