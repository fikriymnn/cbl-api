const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const FgStockOpname = db.define(
  "fg_stock_opname",
  {
    id_user_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_create: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    tgl_approve: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    period_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    period_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
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

// Users.hasMany(FgStockOpname, {
//   foreignKey: "id_user_create",
//   as: "stock_opname_create",
// });
FgStockOpname.belongsTo(Users, {
  foreignKey: "id_user_create",
  as: "user_create",
});

// Users.hasMany(FgStockOpname, {
//   foreignKey: "id_user_approve",
//   as: "stock_opname_approve",
// });
FgStockOpname.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});

module.exports = FgStockOpname;
