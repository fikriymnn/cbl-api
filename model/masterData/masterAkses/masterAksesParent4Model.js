const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterAksesParent3 = require("./masterAksesParent3Model");

const { DataTypes } = Sequelize;

const MasterAksesParent4 = db.define(
  "ms_akses_parent_4",
  {
    id_akses_parent_3: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterAksesParent3,
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

MasterAksesParent3.hasMany(MasterAksesParent4, {
  foreignKey: "id_akses_parent_3",
  as: "parent_4",
}),
  MasterAksesParent4.belongsTo(MasterAksesParent3, {
    foreignKey: "id_akses_parent_3",
    as: "parent_3",
  });

module.exports = MasterAksesParent4;
