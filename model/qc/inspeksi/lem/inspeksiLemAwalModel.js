const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLem = require("./inspeksiLemModel");

const InspeksiLemAwal = db.define(
  "cs_inspeksi_lem_awal",
  {
    id_inspeksi_lem: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiLem,
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

InspeksiLem.hasMany(InspeksiLemAwal, {
  foreignKey: "id_inspeksi_lem",
  as: "inspeksi_lem_awal",
});
InspeksiLemAwal.belongsTo(InspeksiLem, {
  foreignKey: "id_inspeksi_lem",
  as: "inspeksi_lem",
});

module.exports = InspeksiLemAwal;
