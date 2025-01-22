const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterAksesMain = require("./masterAksesModel");

const { DataTypes } = Sequelize;

const MasterAksesParent1 = db.define(
  "ms_akses_parent_1",
  {
    id_akses_main: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterAksesMain,
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
      defaultValue: false,
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
  },
  {
    freezeTableName: true,
  }
);

MasterAksesMain.hasMany(MasterAksesParent1, {
  foreignKey: "id_akses_main",
  as: "parent_1",
}),
  MasterAksesParent1.belongsTo(MasterAksesMain, {
    foreignKey: "id_akses_main",
    as: "akses_main",
  });

module.exports = MasterAksesParent1;
