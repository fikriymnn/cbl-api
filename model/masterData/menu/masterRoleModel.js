// models/menu/masterRoleModel.js
const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterRole = db.define(
  "master_role",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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

module.exports = MasterRole;
