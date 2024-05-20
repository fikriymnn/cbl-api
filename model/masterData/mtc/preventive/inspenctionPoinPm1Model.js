const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const masterMesin = require("../../masterMesinModel");

const inspectionPointPm1Master = db.define("ms_inspection_point_pm1", {
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
});

masterMesin.hasMany(inspectionPointPm1Master, { foreignKey: "id_mesin" });
inspectionPointPm1Master.belongsTo(masterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

module.exports = inspectionPointPm1Master;
