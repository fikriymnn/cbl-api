const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BAP = db.define(
  "bap",
  {
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_bap: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_create: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    file_before: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_after: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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
module.exports = BAP;
