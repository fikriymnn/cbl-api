const {Sequelize} = require("sequelize")
const db = require("../../config/database");
const {DataTypes} = Sequelize
const inspectionPoint = require("./inspectionPoint");

const inspectionResult = db.define(
    "inspection_task"
    ,{
        id_inspectionPoint: {
            type: DataTypes.STRING,
            allowNull:false,
            references : {
                model: inspectionPoint,
                key: "id"
            }
        },
        
})


// inspectionPoint.hasMany(inspectionTask,{foreignKey:"id_inspectionPoint"})

// inspectionTask.belongsTo(inspectionPoint,{foreignKey:"id_inspectionPoint",as:"inspectionPoint"})

module.exports = inspectionResult
