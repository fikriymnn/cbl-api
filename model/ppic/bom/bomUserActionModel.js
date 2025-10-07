const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomUserAction = db.define(
  "bom_user_action",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
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

BomModel.hasMany(BomUserAction, {
  foreignKey: "id_bom",
  as: "bom_action_user",
});
BomUserAction.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

Users.hasMany(BomUserAction, {
  foreignKey: "id_user",
});
BomUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = BomUserAction;
