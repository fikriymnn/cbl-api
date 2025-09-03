const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Okp = require("./okpModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const okpUserAction = db.define(
  "okp_user_action",
  {
    id_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Okp,
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

Okp.hasMany(okpUserAction, {
  foreignKey: "id_okp",
  as: "okp_action_user",
});
okpUserAction.belongsTo(Okp, {
  foreignKey: "id_okp",
  as: "okp",
});

Users.hasMany(okpUserAction, {
  foreignKey: "id_user",
});
okpUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = okpUserAction;
