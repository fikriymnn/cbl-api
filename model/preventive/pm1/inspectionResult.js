const {Sequelize} = require("sequelize")
const db = require("../../../config/database");
const {DataTypes} = Sequelize
const inspectionPoint = require("./inspectionPoint");
const TicketOs3 = require("./maintenanceTicketPM1Model");

const inspectionResult = db.define(
    "inspection_task"
    ,{
        id_ticket: {
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:TicketOs3,
                key:"id"
            }
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull:false,
        },
        inspection_point:{
            type: DataTypes.STRING,
            allowNull:false
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
       
})


TicketOs3.hasMany(inspectionResult,{foreignKey:"id_ticket"})
inspectionResult.belongsTo(TicketOs3,{foreignKey:"id_ticket",as:"ticket"})

module.exports = inspectionResult
