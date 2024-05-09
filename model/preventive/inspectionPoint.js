const {Sequelize} = require("sequelize")
const db = require("../../config/database");
const TicketOs3 = require("../maintenanceTicketOs3Model")
const {DataTypes} = Sequelize

const inspectionPoint = db.define(
    "inspection_point"
    ,{
        nama_mesin:{
            type: DataTypes.STRING,
            allowNull:false
        },
        inspectionPoint: {
            type: DataTypes.STRING,
            allowNull:false,
            validate:{
               notEmpty:true
            }
        },
        id_ticket: {
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
                model: TicketOs3,
                key: "id"
            }
        }
})

TicketOs3.hasMany(inspectionPoint,{foreignKey : "id_ticket"})
inspectionPoint.belongsTo(TicketOs3, {foreignKey : "id_ticket", as:"ticket"})

module.exports = inspectionPoint

