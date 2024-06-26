const { Sequelize } = require("sequelize");
const db = require("../../../../../config/database");
const { DataTypes } = Sequelize;
const masterInspectionPoint = require("./inspenctionPoinPm1Model");

const inspectionTaskPm1Master = db.define("ms_inspection_task_pm1", {
  id_inspection_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: masterInspectionPoint,
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
    allowNull: true,
  },
});

masterInspectionPoint.hasMany(inspectionTaskPm1Master, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm1Master.belongsTo(masterInspectionPoint, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm1Master;
