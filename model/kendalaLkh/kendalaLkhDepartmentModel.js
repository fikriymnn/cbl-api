const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const kendalaLkh = require("./kendalaLkhModel");

const { DataTypes } = Sequelize;

const KendalaLkhDepartment = db.define(
  "kendala_lkh_department",
  {
    id_kendala_lkh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: kendalaLkh,
        key: "id",
      },
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

kendalaLkh.hasMany(KendalaLkhDepartment, {
  foreignKey: "id_kendala_lkh",
  as: "data_department",
});

KendalaLkhDepartment.belongsTo(kendalaLkh, {
  foreignKey: "id_kendala_lkh",
  as: "data_kendala_lkh",
});

module.exports = KendalaLkhDepartment;
