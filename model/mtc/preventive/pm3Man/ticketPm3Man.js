const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const masterMesin = require("../../../masterData/masterMesinModel");
const Users = require("../../../userModel");

const ticketPm3 = db.define("ticket_pm3", {
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
  tgl_request_from: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tgl_request_to: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tgl_approve_from: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tgl_approve_to: {
    type: DataTypes.DATE,
    allowNull: true,
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
});

masterMesin.hasMany(ticketPm3, { foreignKey: "id_mesin" });
Users.hasMany(ticketPm3, { foreignKey: "id_inspector" });

ticketPm3.belongsTo(masterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

ticketPm3.belongsTo(Users, {
  foreignKey: "id_inspector",
  as: "inspector",
});

module.exports = ticketPm3;
