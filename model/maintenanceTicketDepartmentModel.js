const { Sequelize } = require("sequelize");
const db = require("../config/database");
const TicketMaintenance = require("./maintenaceTicketModel");

const { DataTypes } = Sequelize;

const TicketMaintenanceDepartment = db.define(
  "ticket_mtc_department",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TicketMaintenance,
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

TicketMaintenance.hasMany(TicketMaintenanceDepartment, {
  foreignKey: "id_ticket",
  as: "data_department",
});

TicketMaintenanceDepartment.belongsTo(TicketMaintenance, {
  foreignKey: "id_ticket",
  as: "data_tiket_mtc",
});

module.exports = TicketMaintenanceDepartment;
