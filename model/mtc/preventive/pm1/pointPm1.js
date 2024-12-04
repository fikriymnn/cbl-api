const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Ticketpm1 = require("./ticketPm1");

const inspectionPointPm1 = db.define("inspection_point_pm1", {
  id_ticket: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ticketpm1,
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

Ticketpm1.hasMany(inspectionPointPm1, {
  foreignKey: "id_ticket",
});
Ticketpm1.hasMany(inspectionPointPm1, {
  as: "point_pm1",
  foreignKey: "id_ticket",
});
inspectionPointPm1.belongsTo(Ticketpm1, {
  foreignKey: "id_ticket",
});

module.exports = inspectionPointPm1;
