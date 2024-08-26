const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const NcrDepartment = require("./ncrDepartmentModel");

const { DataTypes } = Sequelize;

const NcrKetidaksesuaian = db.define(
  "ncr_ketidaksesuaian",
  {
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: NcrDepartment,
        key: "id",
      },
    },
    ketidaksesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

NcrDepartment.hasMany(NcrKetidaksesuaian, {
  foreignKey: "id_department",
  as: "data_ketidaksesuaian",
});

NcrKetidaksesuaian.belongsTo(NcrDepartment, {
  foreignKey: "id_department",
  as: "data_ketidaksesuaian",
});

module.exports = NcrKetidaksesuaian;
