const {Sequelize} = require("sequelize")
const db = require("../../../config/database");
const {DataTypes} = Sequelize
const inspectionPoint = require("./inspectionPoint");
const TicketOs3 = require("../../maintenanceTicketOs3Model");
const MasterMesin = require("../../masterData/masterMesinModel");

const inspectionResult = db.define(
    "inspection_task"
    ,{
        id_ticket: {
            type : DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: TicketOs3
            }
        },
        nama_mesin: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        id_mesin:{
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:MasterMesin
            }
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull:false,
        },
        hasil: {
            type: DataTypes.STRING,
            allowNull:false
        },
        file: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        catatan: {
            type: DataTypes.STRING,
            allowNull: false
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
})
TicketOs3.hasMany(inspectionResult,{foreignKey:"id_ticket"})
TicketOs3.hasMany(MasterMesin,{foreignKey:"id_mesin"})

inspectionResult.belongsTo(TicketOs3,{foreignKey:"id_ticket",as:"ticket"})
inspectionResult.belongsTo(MasterMesin,{foreignKey:"id_mesin",as:"mesin"})

module.exports = inspectionResult
