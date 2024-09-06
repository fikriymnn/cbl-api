const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetakPeriode = require("./inspeksiCetakPeriodeModel");
const User = require("../../../userModel");

const InspeksiCetakPeriodePoint = db.define(
  "cs_inspeksi_cetak_periode_point",
  {
    id_inspeksi_cetak_periode: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCetakPeriode,
        key: "id",
      },
    },
    id_inspektor: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    numerator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_sampling: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCetakPeriode.hasMany(InspeksiCetakPeriodePoint, {
  foreignKey: "id_inspeksi_cetak_periode",
  as: "inspeksi_cetak_periode_point",
});
InspeksiCetakPeriodePoint.belongsTo(InspeksiCetakPeriode, {
  foreignKey: "id_inspeksi_cetak_periode",
  as: "inspeksi_periode_point",
});

User.hasMany(InspeksiCetakPeriodePoint, {
  foreignKey: "id_inspektor",
});
InspeksiCetakPeriodePoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiCetakPeriodePoint;
