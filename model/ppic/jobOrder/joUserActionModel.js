const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const JobOrderModel = require("./jobOrderModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const JobOrderUserAction = db.define(
  "jo_user_action_new",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrderModel,
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },

    tgl: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },

    status: {
      type: DataTypes.STRING,
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

JobOrderModel.hasMany(JobOrderUserAction, {
  foreignKey: "id_jo",
  as: "jo_action_user",
});
JobOrderUserAction.belongsTo(JobOrderModel, {
  foreignKey: "id_jo",
  as: "jo",
});

Users.hasMany(JobOrderUserAction, {
  foreignKey: "id_user",
});
JobOrderUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = JobOrderUserAction;
