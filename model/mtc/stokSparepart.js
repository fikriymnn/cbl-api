const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const masalahSparepart = require("../mtc/sparepartProblem")

const { DataTypes } = Sequelize;

const StokSparepart = db.define(
  "stok_sparepart",
  {
    kode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nama_sparepart: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_part: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    persen: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kebutuhan_bulanan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    umur_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    vendor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);



module.exports = StokSparepart;
