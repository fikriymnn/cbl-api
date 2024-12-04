const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const masalahSparepart = require("../mtc/sparepartProblem");
const MasterMesin = require("../masterData/masterMesinModel");

const { DataTypes } = Sequelize;

const StokSparepart = db.define(
  "stok_sparepart",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesin,
        key: "id",
      },
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    part_number: {
      type: DataTypes.STRING,
      allowNull: true,
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
    lokasi: {
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
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    percent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type_part: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    limit_stok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

MasterMesin.hasMany(StokSparepart, { foreignKey: "id_mesin" });

StokSparepart.belongsTo(MasterMesin, { foreignKey: "id_mesin", as: "mesin" });

module.exports = StokSparepart;
