const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const NcrTiket = require("./ncrTicketModel");

const { DataTypes } = Sequelize;

const NcrDepartment = db.define(
  "ncr_Department",
  {
    id_ncr_tiket: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: NcrTiket,
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

NcrTiket.hasMany(NcrDepartment, {
  foreignKey: "id_ncr_tiket",
  as: "data_department",
});

NcrDepartment.belongsTo(NcrTiket, {
  foreignKey: "id_ncr_tiket",
  as: "data_department",
});

module.exports = NcrDepartment;
