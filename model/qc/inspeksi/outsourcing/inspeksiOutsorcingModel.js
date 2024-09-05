const {Sequelize} = require("sequelize")
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiOutsourcing = db.define(
  "cs_inspeksi_outsourcing",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_inspector: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references : {
        model: Users
      }
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah_druk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outsourcing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kesesuaian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_outsourcing: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiOutsourcing.belongsTo(Users,{foreignKey:"id_inspector",as:"inspector"})

Users.hasMany(Users,{foreignKey:"id_inspector"})


module.exports = InspeksiOutsourcing;

