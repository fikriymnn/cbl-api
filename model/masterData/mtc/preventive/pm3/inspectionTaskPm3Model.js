const { Sequelize } = require("sequelize");
const db = require("../../../../../config/database");
const { DataTypes } = Sequelize;
const masterInspectionPointPm3 = require("./inspenctionPoinPm3Model");

const inspectionTaskPm3Master = db.define("ms_inspection_task_pm3", {
  id_inspection_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: masterInspectionPointPm3,
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

masterInspectionPointPm3.hasMany(inspectionTaskPm3Master, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm3Master.belongsTo(masterInspectionPointPm3, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

async () => {
  await inspectionTaskPm3Master.sync({ alter: true });
};

module.exports = inspectionTaskPm3Master;
