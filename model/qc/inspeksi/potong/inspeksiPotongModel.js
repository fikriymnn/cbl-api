const {Sequelize} = require("sequelize")
const {DataTypes} = Sequelize
const db = require("../../../../config/database")

const InspeksiPotong = db.define(
    "cs_inspeksi_potong",
    {
        jenis_potong:{
           type: DataTypes.STRING,
           allowNull: false 
        },
        tanggal: {
            type : DataTypes.STRING,
            allowNull: false
        },
        no_jo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        no_io : {
            type: DataTypes.STRING,
            allowNull: false
        },
        mesin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        operator : {
            type: DataTypes.STRING,
            allowNull: false
        },
        shift: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jam: {
            type: DataTypes.STRING,
            allowNull: false
        },
        item : {
            type : DataTypes.STRING,
            allowNull: false
        },
        inspector : {
            type: DataTypes.STRING,
            allowNull: false
        },
        status : {
            type: DataTypes.STRING,
            defaultValue: "incoming"
        }
    },
    {
        freezeTableName: true
    }
)

module.exports = InspeksiPotong