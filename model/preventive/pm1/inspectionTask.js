const {Sequelize} = require("sequelize")
const db = require("../../../config/database");
const {DataTypes} = Sequelize
const inspectionPoint = require("./inspectionPoint");
const TicketOs3 = require("./maintenanceTicketPM1Model");
const MasterMesin = require("../../masterData/masterMesinModel");

const inspectionTask = db.define(
    "inspection_task"
    ,{
        id_mesin: {
            type: DataTypes.INTEGER,
            allowNull:false,
            references:{
              model: Mesin,
              key: "id"
          }
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


MasterMesin.hasMany(inspectionTask,{foreignKey:"id_mesin"})

inspectionTask.belongsTo(MasterMesin,{foreignKey:"id_mesin",as:"mesin"})

module.exports = inspectionTask
