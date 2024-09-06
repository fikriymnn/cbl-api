const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPond = require("./inspeksiPondModel");

const InspeksiPondAwal = db.define(
  "cs_inspeksi_pond_awal",
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
  },
  {
    freezeTableName: true,
  }
);

InspeksiPond.hasMany(InspeksiPondAwal, {
  foreignKey: "id_inspeksi_pond",
  as: "inspeksi_pond_awal",
});
InspeksiPondAwal.belongsTo(InspeksiPond, {
  foreignKey: "id_inspeksi_pond",
  as: "inspeksi_pond",
});

module.exports = InspeksiPondAwal;
