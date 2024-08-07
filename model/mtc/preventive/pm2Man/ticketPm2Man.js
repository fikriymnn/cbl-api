const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const masterMesin = require("../../../masterData/masterMesinModel");
const Users = require("../../../userModel");

const ticketPm2Man = db.define(
  "ticket_pm2_man",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: masterMesin,
        key: "id",
      },
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tgl: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tgl_inspeksi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_inspector: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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
  },
  {
    freezeTableName: true,
  }
);

masterMesin.hasMany(ticketPm2Man, { foreignKey: "id_mesin" });
Users.hasMany(ticketPm2Man, { foreignKey: "id_inspector" });

ticketPm2Man.belongsTo(masterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

ticketPm2Man.belongsTo(Users, {
  foreignKey: "id_inspector",
  as: "inspector",
});

module.exports = ticketPm2Man;
