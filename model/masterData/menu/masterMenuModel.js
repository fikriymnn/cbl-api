// models/menu/masterMenuModel.js
const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const { DataTypes } = Sequelize;

const MasterMenu = db.define(
  "master_menu",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "master_menu",
        key: "id",
      },
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1=parent, 2=child, 3=grandchild",
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

// Self-referencing relationship untuk nested menu
MasterMenu.hasMany(MasterMenu, {
  foreignKey: "parent_id",
  as: "children",
});
MasterMenu.belongsTo(MasterMenu, {
  foreignKey: "parent_id",
  as: "parent",
});

module.exports = MasterMenu;
