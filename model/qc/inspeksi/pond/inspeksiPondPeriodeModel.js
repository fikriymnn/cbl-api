const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPond = require("./inspeksiPondModel");

const InspeksiPondPeriode = db.define(
  "cs_inspeksi_pond_periode",
  {
    id_inspeksi_pond: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiPond,
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

InspeksiPond.hasMany(InspeksiPondPeriode, {
  foreignKey: "id_inspeksi_pond",
  as: "inspeksi_pond_periode",
});
InspeksiPondPeriode.belongsTo(InspeksiPond, {
  foreignKey: "id_inspeksi_pond",
  as: "inspeksi_pond",
});

module.exports = InspeksiPondPeriode;
