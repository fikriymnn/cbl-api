const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Users = require("./userModel")
const Mesin = require("./masterData/masterMesinModel")

const { DataTypes } = Sequelize;

const TicketOs3 = db.define(
    "ticket_os3",
    {
      nama_mesin: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      id_inspector: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
          model: Users,
          key: "id",
        },
      },
      id_leader: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
          model: Users,
          key: "id",
        },
      },
      id_supervisor: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
          model: Users,
          key: "id",
        },
      },
      id_kabag_mtc: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
          model: Users,
          key: "id",
        },
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      catatan: {
        type: DataTypes.STRING,
        allowNull:true,            
      },
      bagian_tiket: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "incoming",
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
    }},
    {
      freezeTableName: true,
    }
  );

Users.hasMany(TicketOs3,{foreignKey : "id_inspector"})
Users.hasMany(TicketOs3,{foreignKey : "id_supervisor"})
Users.hasMany(TicketOs3,{foreignKey : "id_leader"})
Users.hasMany(TicketOs3,{foreignKey : "id_kabag_mtc"})

TicketOs3.belongsTo(Users, {foreignKey : "id_inspector", as:"inspector"})
TicketOs3.belongsTo(Users, {foreignKey : "id_supervisor", as:"supervisor"})
TicketOs3.belongsTo(Users, {foreignKey : "id_leader", as:"leader"})
TicketOs3.belongsTo(Users, {foreignKey : "id_kabag_mtc", as:"kabag_mtc"})
  
module.exports = TicketOs3;