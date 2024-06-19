const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Users = require("./userModel");
const { DataTypes } = Sequelize;

const Notification = db.define(
  "notification",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "unread",
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(Users, {
  foreignKey: "user_id",
});

module.exports = Notification;
