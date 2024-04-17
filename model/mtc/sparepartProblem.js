const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Ticket = require("../maintenaceTicketModel")
const MasterSparepart = require("../masterData/masterSparepart")


const { DataTypes } = Sequelize;

const SparepartProblem = db.define(
  "masalah_sparepart",
  {
    
    id_tiket: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
          model: Ticket,
          key: "id"
        }
      },
      id_ms_sparepart: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
          model: MasterSparepart,
          key: "id"
        }
      },
      id_stok_sparepart: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references:{
        //   model: MasterSparepart,
        //   key: "id"
        // }
      },
    nama_sparepart_sebelumnya: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_sparepart_sebelumnya: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      umur_sparepart_sebelumnya: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      vendor_sparepart_sebelumnya: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nama_sparepart_baru: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      umur_sparepart_baru: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status_sparepart_baru: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vendor_sparepart_baru: {
        type: DataTypes.STRING,
        allowNull: true,
      },
   
  },
  {
    freezeTableName: true,
  }
);

Ticket.hasMany(SparepartProblem,{foreignKey : "id_tiket"}),
MasterSparepart.hasMany(SparepartProblem,{foreignKey : "id_ms_sparepart"}),

SparepartProblem.belongsTo(Ticket, {foreignKey : "id_tiket", as:"problem_sparepart"})
SparepartProblem.belongsTo(MasterSparepart, {foreignKey : "id_ms_sparepart", as:"master_sparepart"})


module.exports = SparepartProblem;