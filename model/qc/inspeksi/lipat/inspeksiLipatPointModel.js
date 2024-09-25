const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLipat = require("./inspeksiLipatModel");

const InspeksiLipatPoint = db.define(
  "cs_inspeksi_lipat_point",
  {
    id_inspeksi_lipat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiLipat,
        key: "id",
      },
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

InspeksiLipat.hasMany(InspeksiLipatPoint, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat_point",
});
InspeksiLipatPoint.belongsTo(InspeksiLipat, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat",
});

module.exports = InspeksiLipatPoint;
