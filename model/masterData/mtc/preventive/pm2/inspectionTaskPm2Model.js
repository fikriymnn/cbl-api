const { Sequelize } = require("sequelize");
const db = require("../../../../../config/database");
const { DataTypes } = Sequelize;
const masterInspectionPointPm2 = require("./inspenctionPoinPm2Model");

const inspectionTaskPm2Master = db.define("ms_inspection_task_pm2", {
  id_inspection_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: masterInspectionPointPm2,
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

masterInspectionPointPm2.hasMany(inspectionTaskPm2Master, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm2Master.belongsTo(masterInspectionPointPm2, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm2Master;
