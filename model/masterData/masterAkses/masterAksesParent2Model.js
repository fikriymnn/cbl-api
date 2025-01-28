const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterAksesParent1 = require("./masterAksesParent1Model");

const { DataTypes } = Sequelize;

const MasterAksesParent2 = db.define(
  "ms_akses_parent_2",
  {
    id_akses_parent_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterAksesParent1,
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
  },
  {
    freezeTableName: true,
  }
);

MasterAksesParent1.hasMany(MasterAksesParent2, {
  foreignKey: "id_akses_parent_1",
  as: "parent_2",
}),
  MasterAksesParent2.belongsTo(MasterAksesParent1, {
    foreignKey: "id_akses_parent_1",
    as: "parent_1",
  });

module.exports = MasterAksesParent2;
