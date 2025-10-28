const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;

const MasterKriteriaKendala = db.define(
  "ms_kriteria_kendala",
  {
    kriteria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterKriteriaKendala;
