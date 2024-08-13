const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCoating = require("./inspeksiCoatingModel");

const InspeksiCoatingResultAwal = db.define(
    "cs_inspeksi_coating_result_awal",
    {
        id_inspeksi_coating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: InspeksiCoating
            }
        },
        inspektor: {
            type: DataTypes.STRING,
            allowNull: true,
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
        catatan: {
            type: DataTypes.STRING,
            allowNull: true
        },
        foto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        line_clearance: {
            type: DataTypes.STRING,
            allowNull: true
        },
        design: {
            type: DataTypes.STRING,
            allowNull: true
        },
        redaksi: {
            type: DataTypes.STRING,
            allowNull: true
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        jenis_bahan: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gramatur: {
            type: DataTypes.STRING,
            allowNull: true
        },
        layout_pisau: {
            type: DataTypes.STRING,
            allowNull: true
        },
        acc_warna_awal_jalan: {
            type: DataTypes.STRING,
            allowNull: true
        },
    },
    {
        freezeTableName: true,
    }
);

InspeksiCoating.hasMany(InspeksiCoatingResultAwal, {
    foreignKey: "id_inspeksi_coating",
    as: "inspeksi_coating_result_awal",
  });
InspeksiCoatingResultAwal.belongsTo(InspeksiCoating, {
    foreignKey: "id_inspeksi_coating",
    as: "inspeksi_coating",
  });

module.exports = InspeksiCoatingResultAwal;