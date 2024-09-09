const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiOutsourcing = require("./inspeksiOutsorcingModel");

const InspeksiOutsourcingPoint = db.define(
    "cs_master_inspeksi_outsourcing_point",
    {
        id_inspeksi_outsourcing : {
            type: DataTypes.INTEGER,
            allowNull: false,
            references : {
                model: InspeksiOutsourcing
            }
        },
        point: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        standar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hasil: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        foto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
       
    },
    {
        freezeTableName: true,
    }
);

InspeksiOutsourcing.hasMany(InspeksiOutsourcingPoint,{foreignKey:"id_inspeksi_outsourcing",as:"inspeksi_outsourcing_point"})
InspeksiOutsourcingPoint.belongsTo(InspeksiOutsourcing,{foreignKey:"id_inspeksi_outsourcing",as:"inspeksi_outsourcing"})

module.exports = InspeksiOutsourcingPoint;