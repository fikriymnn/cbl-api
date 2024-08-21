const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");
const InspeksiFinal = require("./inspeksiFinalModel");

const InspeksiFinalSub = db.define(
    "cs_inspeksi_final_sub",
    {
        id_inspeksi: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: InspeksiFinal
            }
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jumlah: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kualitas_lulus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        kualitas_tolak: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reject: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);

InspeksiFinal.hasMany(InspeksiFinalSub,{
    foreignKey: "id_inspeksi",as:"id_inspeksi"
})

InspeksiFinalSub.belongsTo(InspeksiFinal,{
    foreignKey: 'id_inspeksi',as : "id_inspeksi_sub"
})


module.exports = InspeksiFinalSub;


