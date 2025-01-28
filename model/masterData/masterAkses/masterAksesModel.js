const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const masterRole = require("../masterRoleModel");

const { DataTypes } = Sequelize;

const MasterAkses = db.define(
  "ms_akses",
  {
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: masterRole,
        key: "id",
      },
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_dropdown: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    path_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_parent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_parent_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_parent_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

masterRole.hasMany(MasterAkses, { foreignKey: "id_role", as: "akses" }),
  MasterAkses.belongsTo(masterRole, {
    foreignKey: "id_role",
    as: "role",
  });

module.exports = MasterAkses;
