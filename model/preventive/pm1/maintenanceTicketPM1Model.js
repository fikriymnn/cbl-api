const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel")
const Mesin = require("../../masterData/masterMesinModel")

const { DataTypes } = Sequelize;

const TicketOs3 = db.define(
    "ticket_os3",
    {
      id_mesin: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
          model: Mesin,
          key: "id"
      }
      },
      id_inspector: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
            model: Users,
            key: "id"
        }
      },
      id_leader: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
            model: Users,
            key: "id"
        }
      },
      id_supervisor: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
            model: Users,
            key: "id"
        }
      },
      id_kabag_mtc: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: Users,
            key:"id"
        }
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
      status_tiket: {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:"history",
        validate:{
            notEmpty:true,
        }
      },
    },
    
    {
      freezeTableName: true,
    }
  );

Users.hasMany(TicketOs3,{foreignKey : "id_inspector"})
Users.hasMany(TicketOs3,{foreignKey : "id_supervisor"})
Users.hasMany(TicketOs3,{foreignKey : "id_leader"})
Users.hasMany(TicketOs3,{foreignKey : "id_kabag_mtc"})
Users.hasMany(TicketOs3,{foreignKey : "id_kabag_mtc"})
Mesin.hasMany(TicketOs3,{foreignKey : "id_mesin"})

TicketOs3.belongsTo(Users, {foreignKey : "id_inspector", as:"inspector"})
TicketOs3.belongsTo(Users, {foreignKey : "id_supervisor", as:"supervisor"})
TicketOs3.belongsTo(Users, {foreignKey : "id_leader", as:"leader"})
TicketOs3.belongsTo(Users, {foreignKey : "id_kabag_mtc", as:"kabag_mtc"})
TicketOs3.belongsTo(Mesin, {foreignKey : "id_mesin", as:"mesin"})
  
  module.exports = TicketOs3;