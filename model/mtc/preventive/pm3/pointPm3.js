const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Ticketpm3 = require("./ticketPm3");

const inspectionPointPm3 = db.define("inspection_point_pm3", {
  id_ticket: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ticketpm3,
      key: "id",
    },
  },
  inspection_point: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tgl: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  hasil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  catatan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  waktu_mulai: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  waktu_selesai: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lama_pengerjaan: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Ticketpm3.hasMany(inspectionPointPm3, {
  foreignKey: "id_ticket",
});
Ticketpm3.hasMany(inspectionPointPm3, {
  as: "point_pm3",
  foreignKey: "id_ticket",
});
inspectionPointPm3.belongsTo(Ticketpm3, {
  foreignKey: "id_ticket",
});

module.exports = inspectionPointPm3;
