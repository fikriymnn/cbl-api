const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPointPm3Man = require("./pointPm3Man");

const inspectionTaskPm3 = db.define(
  "inspection_task_pm3_man",
  {
    id_inspection_poin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: inspectionPointPm3Man,
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

inspectionPointPm3Man.hasMany(inspectionTaskPm3, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm3.belongsTo(inspectionPointPm3Man, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm3;
