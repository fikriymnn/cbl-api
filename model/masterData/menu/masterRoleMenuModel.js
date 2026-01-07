// models/menu/roleMenuModel.js
const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterRole = require("./masterRoleModel");
const MasterMenu = require("./masterMenuModel");

const { DataTypes } = Sequelize;

const RoleMenu = db.define(
  "role_menu",
  {
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterRole,
        key: "id",
      },
    },
    id_menu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterMenu,
        key: "id",
      },
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    can_create: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    can_edit: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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

// Relationships
MasterRole.hasMany(RoleMenu, {
  foreignKey: "id_role",
  as: "role_menus",
});
RoleMenu.belongsTo(MasterRole, {
  foreignKey: "id_role",
  as: "role",
});

MasterMenu.hasMany(RoleMenu, {
  foreignKey: "id_menu",
  as: "menu_roles",
});
RoleMenu.belongsTo(MasterMenu, {
  foreignKey: "id_menu",
  as: "menu",
});

module.exports = RoleMenu;
