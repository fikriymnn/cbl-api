const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../../config/database");
const InspeksiCoating = require("../inspeksiCoatingModel");
const Users = require("../../../../userModel");

const InspeksiCoatingResultPeriode = db.define(
    "cs_inspeksi_coating_result_periode",
    {
        id_inspeksi_coating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: InspeksiCoating
            }
        },
        waktu_mulai: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        waktu_selesai: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lama_pengerjaan: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        foto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        waktu_sampling: {
            type: DataTypes.STRING,
            allowNull: true
        },
        inspector: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model : Users
            }
        },
        numerator: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nilai_glossy_kiri: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        nilai_glossy_tengah: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        nilai_glossy_kanan: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        jumlah_sampling: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
    {
        freezeTableName: true,
    }
);

InspeksiCoating.hasMany(InspeksiCoatingResultPeriode, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating_result_periode",
});
InspeksiCoatingResultPeriode.belongsTo(InspeksiCoating, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating",
});

module.exports = InspeksiCoatingResultPeriode;
