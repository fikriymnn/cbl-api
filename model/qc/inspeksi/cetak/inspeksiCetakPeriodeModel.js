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
    sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
