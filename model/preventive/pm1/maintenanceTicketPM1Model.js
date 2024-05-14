const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel")
const Mesin = require("../../masterData/masterMesinModel")

const { DataTypes } = Sequelize;

const TicketOs3 = db.define(
    "ticket_os3",
    {
      nama_mesin: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      inspector: {
        type: DataTypes.STRING,
        allowNull:true,
      },
      leader: {
        type: DataTypes.STRING,
        allowNull:true,
      },
      supervisor: {
        type: DataTypes.STRING,
        allowNull:true,
      },
      kabag_mtc: {
        type: DataTypes.STRING,
        allowNull:false,
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
        defaultValue:"pending",
        validate: {
          notEmpty:true,
        }
      },
    },
    
    {
      freezeTableName: true,
    }
  );

// Users.hasMany(TicketOs3,{foreignKey : "id_inspector"})
// Users.hasMany(TicketOs3,{foreignKey : "id_supervisor"})
// Users.hasMany(TicketOs3,{foreignKey : "id_leader"})
// Users.hasMany(TicketOs3,{foreignKey : "id_kabag_mtc"})
// Users.hasMany(TicketOs3,{foreignKey : "id_kabag_mtc"})

// TicketOs3.belongsTo(Users, {foreignKey : "id_inspector", as:"inspector"})
// TicketOs3.belongsTo(Users, {foreignKey : "id_supervisor", as:"supervisor"})
// TicketOs3.belongsTo(Users, {foreignKey : "id_leader", as:"leader"})
// TicketOs3.belongsTo(Users, {foreignKey : "id_kabag_mtc", as:"kabag_mtc"})
  
module.exports = TicketOs3;