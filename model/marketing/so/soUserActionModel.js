const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const So = require("./soModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const soUserAction = db.define(
  "so_user_action",
  {
    id_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: So,
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

So.hasMany(soUserAction, {
  foreignKey: "id_so",
  as: "so_action_user",
});
soUserAction.belongsTo(So, {
  foreignKey: "id_so",
  as: "so",
});

Users.hasMany(soUserAction, {
  foreignKey: "id_user",
});
soUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = soUserAction;
