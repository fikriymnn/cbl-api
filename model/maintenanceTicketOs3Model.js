const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Users = require("./userModel");
const Mesin = require("./masterData/masterMesinModel");
const PointPm1 = require("./mtc/preventive/pm1/pointPm1");

const { DataTypes } = Sequelize;

const TicketOs3 = db.define(
  "ticket_os3",
  {
    id_point_pm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PointPm1,
        key: "id",
      },
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bagian_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "os3",
      validate: {
        notEmpty: true,
      },
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        notEmpty: true,
      },
    },
    waktu_respon: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai_mtc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_mtc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    skor_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    cara_perbaikan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

TicketOs3.hasMany(PointPm1, { foreignKey: "id_point_pm" });
PointPm1.belongsTo(TicketOs3, { foreignKey: "id_inspector", as: "inspector" });

module.exports = TicketOs3;
