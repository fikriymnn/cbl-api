const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const masterInspectionPoint = require("./inspenctionPoinPm1Model");

const KpiMaster = db.define("ms_inspection_task_pm1", {
  bagian: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cascade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_function: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bobot_nilai: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_100: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_50: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_0: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = KpiMaster;
