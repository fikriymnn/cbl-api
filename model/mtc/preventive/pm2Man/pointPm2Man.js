const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Ticketpm2Man = require("./ticketPm2Man");

const inspectionPointPm2Man = db.define(
  "inspection_point_pm2_man",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ticketpm2Man,
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
  },
  {
    freezeTableName: true,
  }
);

Ticketpm2Man.hasMany(inspectionPointPm2Man, {
  foreignKey: "id_ticket",
});
inspectionPointPm2Man.belongsTo(Ticketpm2Man, {
  foreignKey: "id_ticket",
});

module.exports = inspectionPointPm2Man;
