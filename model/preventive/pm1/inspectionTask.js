const {Sequelize} = require("sequelize")
const db = require("../../../config/database");
const {DataTypes} = Sequelize
const inspectionPoint = require("./inspectionPoint");
const TicketOs3 = require("./maintenanceTicketPM1Model");
const MasterMesin = require("../../masterData/masterMesinModel");

const inspectionTask = db.define(
    "inspection_task"
    ,{
        nama_mesin: {
            type: DataTypes.STRING,
            allowNull:false
        },
        inspection_point: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        task: {
            type: DataTypes.STRING,
            allowNull:false
        },
        acceptance_criteria: {
            type: DataTypes.STRING,
            allowNull:false
        },
        method: {
            type: DataTypes.STRING,
            allowNull:false
        },
        tools: {
            type: DataTypes.STRING,
            allowNull:false
        },
        
    }
)


module.exports = inspectionTask
