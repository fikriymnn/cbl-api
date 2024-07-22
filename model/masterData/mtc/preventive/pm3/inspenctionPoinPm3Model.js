const { Sequelize } = require("sequelize");
const db = require("../../../../../config/database");
const { DataTypes } = Sequelize;
const masterMesin = require("../../../masterMesinModel");

const inspectionPointPm3Master = db.define("ms_inspection_point_pm3", {
  id_mesin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: masterMesin,
      key: "id",
    },
  },
  nama_mesin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inspection_point: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

masterMesin.hasMany(inspectionPointPm3Master, { foreignKey: "id_mesin" });
inspectionPointPm3Master.belongsTo(masterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

module.exports = inspectionPointPm3Master;
