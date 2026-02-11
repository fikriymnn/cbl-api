const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpicUserAction = db.define(
  "bom_ppic_user_action",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
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

BomPpicModel.hasMany(BomPpicUserAction, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_action_user",
});
BomPpicUserAction.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

Users.hasMany(BomPpicUserAction, {
  foreignKey: "id_user",
});
BomPpicUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = BomPpicUserAction;
