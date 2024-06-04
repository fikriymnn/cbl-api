const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;
const Users = require("../../userModel")

const KpiTicket = db.define(
    "kpi_ticket",
    {
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Users,
                key: "id",
            },
        },
        role : {
            type: DataTypes.STRING,
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull: false
        },
        total_point: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        penilaian: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);

Users.hasMany(KpiTicket, {
    foreignKey: "id_user",
}),

KpiTicket.belongsTo(Users, {
        foreignKey: "id_user", as: "user"
});

module.exports = KpiTicket;
