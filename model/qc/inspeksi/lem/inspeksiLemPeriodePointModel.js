const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLemPeriode = require("./inspeksiLemPeriodeModel");
const User = require("../../../userModel");

const InspeksiLemPeriodePoint = db.define(
  "cs_inspeksi_lem_periode_point",
  {
    id_inspeksi_lem_periode: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiLemPeriode,
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

InspeksiLemPeriode.hasMany(InspeksiLemPeriodePoint, {
  foreignKey: "id_inspeksi_lem_periode",
  as: "inspeksi_lem_periode_point",
});
InspeksiLemPeriodePoint.belongsTo(InspeksiLemPeriode, {
  foreignKey: "id_inspeksi_lem_periode",
  as: "inspeksi_periode_point",
});

User.hasMany(InspeksiLemPeriodePoint, {
  foreignKey: "id_inspektor",
});
InspeksiLemPeriodePoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiLemPeriodePoint;
