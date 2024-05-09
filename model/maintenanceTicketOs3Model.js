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
        validate:{
            notEmpty:true
        }
      },
      inspector: {
        type: DataTypes.STRING,
        allowNull:true
        // ,
        // references:{
        //     model: Users,
        //     key: "id"
        // }
      },
      leader: {
        type: DataTypes.STRING,
        allowNull:true
        // ,
        // references:{
        //     model: Users,
        //     key: "id"
        // }
      },
      supervisor: {
        type: DataTypes.STRING,
        allowNull:true
        // ,
        // references:{
        //     model: Users,
        //     key: "id"
        // }
      },
      kabag_mtc: {
        type: DataTypes.STRING,
        allowNull:false,
        // references:{
        //     model: Users,
        //     key:"id"
        // }
      },
      tgl: {
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
        allowNull:false,
        defaultValue:"incoming",
        validate:{
            notEmpty:true,
        }
      },
      status_tiket: {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:"pending",
        validate:{
            notEmpty:true,
        }
      },
      waktu_respon: {
        type: DataTypes.DATE,
        allowNull:true,       
      },
    },
    
    {
      freezeTableName: true,
    }
  );

  
  module.exports = TicketOs3;