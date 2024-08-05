const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const Ticketpm1Man = require("./ticketPm1Man");

const inspectionPointPm1 = db.define(
  "inspection_point_pm1_man",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ticketpm1Man,
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

Ticketpm1Man.hasMany(inspectionPointPm1, {
  foreignKey: "id_ticket",
});
inspectionPointPm1.belongsTo(Ticketpm1Man, {
  foreignKey: "id_ticket",
});

module.exports = inspectionPointPm1;
