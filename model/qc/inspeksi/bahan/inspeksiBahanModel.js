const {Sequelize} = require('sequelize')
const {DataTypes} = Sequelize
const db = require("../../../../config/database")

const InspeksiBahan = db.define("cs_inspeksi_bahan",{
    tanggal : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    no_lot : {
        type : DataTypes.STRING,
        allowNull: true
    },
    no_surat_jalan : {
        type : DataTypes.STRING,
        allowNull: false
    },
    supplier: {
        type : DataTypes.STRING,
        allowNull: false
    },
    jenis_kertas: {
        type : DataTypes.STRING,
        allowNull: false
    },
    ukuran : {
        type: DataTypes.STRING,
        allowNull: false
    },
    jam : {
        type : DataTypes.STRING,
        allowNull : true,
    },
    inspector : {
        type : DataTypes.STRING,
        allowNull: false
    },
    jumlah : {
        type: DataTypes.STRING,
        allowNull: false
    },
    hasil_rumus : {
        type: DataTypes.STRING,
        allowNull: true
    },
    status : {
        type : DataTypes.STRING,
        defaultValue : "incoming"
    },
    verifikasi : {
        type : DataTypes.STRING,
        allowNull: true
    },
    waktu_mulai : {
        type: DataTypes.DATE,
        allowNull: true
    },
    waktu_selesai : {
        type : DataTypes.DATE,
        allowNull: true
    }
},
{
    freezeTableName: true,
  }
)



module.exports = InspeksiBahan
