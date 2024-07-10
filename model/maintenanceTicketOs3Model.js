const { Sequelize } = require("sequelize");
const db = require("../config/database");

const PointPm1 = require("./mtc/preventive/pm1/pointPm1");
const PointPm2 = require("./mtc/preventive/pm2/pointPm2");
const PointPm3 = require("./mtc/preventive/pm3/pointPm3");

const { DataTypes } = Sequelize;

const TicketOs3 = db.define(
  "ticket_os3",
  {
    id_point_pm1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PointPm1,
        key: "id",
      },
    },

    id_point_pm2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PointPm2,
        key: "id",
      },
    },
    id_point_pm3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PointPm3,
        key: "id",
      },
    },

    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode_ticket: {
      type: DataTypes.STRING,
      allowNull: true,
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
    waktu_mulai_mtc: {
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
    jenis_analisis_mtc: {
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

PointPm1.hasMany(TicketOs3, { foreignKey: "id_point_pm1" });
TicketOs3.belongsTo(PointPm1, { foreignKey: "id_point_pm1", as: "point_pm1" });

PointPm2.hasMany(TicketOs3, { foreignKey: "id_point_pm2" });
TicketOs3.belongsTo(PointPm2, { foreignKey: "id_point_pm2", as: "point_pm2" });

PointPm3.hasMany(TicketOs3, { foreignKey: "id_point_pm3" });
TicketOs3.belongsTo(PointPm3, { foreignKey: "id_point_pm3", as: "point_pm3" });

module.exports = TicketOs3;
