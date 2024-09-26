const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPraPlatePoint = require("./inspeksiPraPlateModel");

const InspeksiPraPlateResult = db.define(
  "cs_inspeksi_pra_plate_result",
  {
    id_inspeksi_pra_plate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiPraPlatePoint,
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

InspeksiPraPlatePoint.hasMany(InspeksiPraPlateResult, {
  foreignKey: "id_inspeksi_pra_plate",
  as: "inspeksi_pra_plate_result",
});
InspeksiPraPlateResult.belongsTo(InspeksiPraPlatePoint, {
  foreignKey: "id_inspeksi_pra_plate",
  as: "inspeksi_pra_plate_point",
});

module.exports = InspeksiPraPlateResult;
