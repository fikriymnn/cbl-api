const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiFinal = db.define(
  "cs_inspeksi_final",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jam: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      inspector: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users
        }
      },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_pallet : {
        type: DataTypes.STRING,
        allowNull: true,
    },
    no_packing : {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_packing : {
        type : DataTypes.FLOAT,
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

module.exports = InspeksiFinal;