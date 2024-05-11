const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPoint = require("./inspectionPoint");

const inspectionTask = db.define("inspection_task", {
  id_inspectionPoint: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: inspectionPoint,
      key: "id",
    },
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

inspectionPoint.hasMany(inspectionTask, { foreignKey: "id_inspectionPoint" });

inspectionTask.belongsTo(inspectionPoint, {
  foreignKey: "id_inspectionPoint",
  as: "inspectionPoint",
});

module.exports = inspectionTask;
