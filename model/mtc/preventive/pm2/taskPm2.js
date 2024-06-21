const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPointPm2 = require("./pointPm2");

const inspectionTaskPm2 = db.define("inspection_task_pm2", {
  id_inspection_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: inspectionPointPm2,
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

inspectionPointPm2.hasMany(inspectionTaskPm2, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm2.belongsTo(inspectionPointPm2, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm2;
