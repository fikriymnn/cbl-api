const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Ticketpm2 = require("./ticketPm2");

const inspectionPointPm2 = db.define("inspection_point_pm2", {
  id_ticket: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ticketpm2,
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

Ticketpm2.hasMany(inspectionPointPm2, {
  foreignKey: "id_ticket",
});
inspectionPointPm2.belongsTo(Ticketpm2, {
  foreignKey: "id_ticket",
});

module.exports = inspectionPointPm2;
