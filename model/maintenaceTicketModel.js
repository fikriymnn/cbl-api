const { Sequelize } = require("sequelize");
const db = require("../config/database");

const { DataTypes } = Sequelize;

const Ticket = db.define(
    "ticket",
    {
      idJo: {
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      noJo: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      namaProduk: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      noIo: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      noSo: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      namaCustomer: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      qtyDruk: {
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      spek: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      proses: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      bagian: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      mesin: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      operator: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      jenisKendala: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      idKendala: {
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      namaKendala: {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true
        }
      },
      statusTiket: {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:"pending",
        validate:{
            notEmpty:true,
        }
      },
      statusJadwal: {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:"unscheduled",
        validate:{
            notEmpty:true
        }
      },
      jadwalFrom: {
        type: DataTypes.DATE,
        allowNull:true,
        
      },
      jadwalTo: {
        type: DataTypes.DATE,
        allowNull:true,       
      },
      responseTime: {
        type: DataTypes.DATE,
        allowNull:true,       
      },
      doneTime: {
        type: DataTypes.DATE,
        allowNull:true,       
      },
      idMtc: {
        type: DataTypes.INTEGER,
        allowNull:true       
      },
      idQc: {
        type: DataTypes.INTEGER,
        allowNull:true        
      },

    },
    
    {
      freezeTableName: true,
    }
  );
  
  module.exports = Ticket;