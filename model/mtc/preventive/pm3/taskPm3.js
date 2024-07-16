const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPointPm3 = require("./pointPm3");

const inspectionTaskPm3 = db.define("inspection_task_pm3", {
  id_inspection_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: inspectionPointPm3,
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

inspectionPointPm3.hasMany(inspectionTaskPm3, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm3.belongsTo(inspectionPointPm3, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm3;
