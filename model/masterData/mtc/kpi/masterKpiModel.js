const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;

const KpiMaster = db.define("ms_kpi", {
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
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bobot_nilai: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ip_100: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ip_0: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reverse: {
    type : DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = KpiMaster;
