const { Sequelize } = require("sequelize")
const { DataTypes } = Sequelize
const db = require("../../../config/database")
const Project = require("./projectModel")

const SubProjectMtc = db.define("project_mtc_sub",
    {
        id_project: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: Project,
                key:"id"
            }
        },
        task: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lead: {
            type: DataTypes.STRING,
            allowNull: false
        },
        qty : {
            type : DataTypes.INTEGER,
            allowNull: false
        },
        problem : {
            type : DataTypes.STRING,
            allowNull: false
        },
        start : {
            type : DataTypes.DATE,
            allowNull: false
        },
        end : {
            type : DataTypes.DATE,
            allowNull: false
        },
        days : {
            type : DataTypes.INTEGER,
            allowNull: false
        },
        done : {
            type : DataTypes.INTEGER,
            allowNull: false
        },
        work_days : {
            type : DataTypes.INTEGER,
            allowNull: false
        }
    }, {
    freezeTableName: true,
})

Project.hasMany(SubProjectMtc,{
    foreignKey:"id_project",
    as:"sub_project"
})
SubProjectMtc.belongsTo(Project,{
    foreignKey:"id_project",
    as:"project"
})

module.exports = SubProjectMtc