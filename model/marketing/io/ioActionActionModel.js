const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Io = require("./ioModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const IoUserAction = db.define(
  "io_user_action",
  {
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Io,
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
      defaultValue: Sequelize.NOW,
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
  },
);

Io.hasMany(IoUserAction, {
  foreignKey: "id_io",
  as: "io_action_user",
});
IoUserAction.belongsTo(Io, {
  foreignKey: "id_io",
  as: "io",
});

Users.hasMany(IoUserAction, {
  foreignKey: "id_user",
});
IoUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = IoUserAction;
