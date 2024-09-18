const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLipat = require("./inspeksiLipatModel");

const InspeksiLipatResult = db.define(
  "cs_inspeksi_lipat_result",
  {
    id_inspeksi_lipat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiLipat,
        key: "id",
      },
    },
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    point_check: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_check: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    send: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiLipat.hasMany(InspeksiLipatResult, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat_result",
});
InspeksiLipatResult.belongsTo(InspeksiLipat, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat",
});

module.exports = InspeksiLipatResult;
