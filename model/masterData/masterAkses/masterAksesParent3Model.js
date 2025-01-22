const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterAksesParent2 = require("./masterAksesParent2Model");

const { DataTypes } = Sequelize;

const MasterAksesParent3 = db.define(
  "ms_akses_parent_3",
  {
    id_akses_parent_2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterAksesParent2,
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

MasterAksesParent2.hasMany(MasterAksesParent3, {
  foreignKey: "id_akses_parent_2",
  as: "parent_3",
}),
  MasterAksesParent3.belongsTo(MasterAksesParent2, {
    foreignKey: "id_akses_parent_2",
    as: "parent_2",
  });

module.exports = MasterAksesParent3;
