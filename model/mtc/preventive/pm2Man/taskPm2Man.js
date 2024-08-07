const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPointPm2Man = require("./pointPm2Man");

const inspectionTaskPm2Man = db.define(
  "inspection_task_pm2_man",
  {
    id_inspection_poin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: inspectionPointPm2Man,
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
  },
  {
    freezeTableName: true,
  }
);

inspectionPointPm2Man.hasMany(inspectionTaskPm2Man, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm2Man.belongsTo(inspectionPointPm2Man, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm2Man;
