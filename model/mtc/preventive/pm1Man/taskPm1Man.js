const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const inspectionPointPm1Man = require("./pointPm1Man");

const inspectionTaskPm1 = db.define(
  "inspection_task_pm1_man",
  {
    id_inspection_poin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: inspectionPointPm1Man,
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

inspectionPointPm1Man.hasMany(inspectionTaskPm1, {
  foreignKey: "id_inspection_poin",
});
inspectionTaskPm1.belongsTo(inspectionPointPm1Man, {
  foreignKey: "id_inspection_poin",
  as: "task_hasil",
});

module.exports = inspectionTaskPm1;
