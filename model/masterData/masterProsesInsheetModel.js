const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const MasterProsesInsheet = db.define(
  "ms_proses_insheet",
  {
    proses: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    persentase_insheet: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterProsesInsheet;
