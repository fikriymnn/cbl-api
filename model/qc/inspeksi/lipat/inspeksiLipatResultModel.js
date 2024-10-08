const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLipatPoint = require("./inspeksiLipatPointModel");

const InspeksiLipatResult = db.define(
  "cs_inspeksi_lipat_result",
  {
    id_inspeksi_lipat_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiLipatPoint,
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

InspeksiLipatPoint.hasMany(InspeksiLipatResult, {
  foreignKey: "id_inspeksi_lipat_point",
  as: "inspeksi_lipat_result",
});
InspeksiLipatResult.belongsTo(InspeksiLipatPoint, {
  foreignKey: "id_inspeksi_lipat_point",
  as: "inspeksi_lipat_point",
});

module.exports = InspeksiLipatResult;
