const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const CapaTiket = require("./capaTiketmodel");

const { DataTypes } = Sequelize;

const CapaKetidaksesuaian = db.define(
  "capa_ketidaksesuaian",
  {
    id_capa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CapaTiket,
        key: "id",
      },
    },
    ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    analisa_penyebab: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tindakan_perbaikan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pencegahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pencegahan_efektif_dilakukan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_ketidak_sesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

CapaTiket.hasMany(CapaKetidaksesuaian, {
  foreignKey: "id_capa",
  as: "data_ketidaksesuaian",
});

CapaKetidaksesuaian.belongsTo(CapaTiket, {
  foreignKey: "id_capa",
  as: "data_capa",
});

module.exports = CapaKetidaksesuaian;
