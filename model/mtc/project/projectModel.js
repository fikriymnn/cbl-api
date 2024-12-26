const {Sequelize} = require("sequelize")
const {DataTypes} = Sequelize
const db = require("../../../config/database")

const ProjectMtc = db.define("project_mtc",
{
    task: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start : {
        type: DataTypes.DATE,
        allowNull: false
    },
    end : {
        type: DataTypes.DATE,
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

},{
    freezeTableName: true,
})

module.exports = ProjectMtc