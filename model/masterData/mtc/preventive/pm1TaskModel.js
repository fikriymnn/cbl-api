const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Mesin = require("../../masterMesinModel");

const inspectionTaskPm1Master = db.define("ms_pm1", {
  id_mesin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesin,
      key: "id",
    },
  },
  nama_mesin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  task: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  acceptance_criteria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tools: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Mesin.hasMany(inspectionTaskPm1Master, { foreignKey: "id_mesin" });

inspectionTaskPm1Master.belongsTo(Mesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

module.exports = inspectionTaskPm1Master;
