const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const MasterMesin = require("./masterMesinModel");

const { DataTypes } = Sequelize;

const MasterSparepart = db.define(
  "ms_sparepart",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterMesin,
        key: "id",
      },
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    nama_sparepart: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    jenis_part: {
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
    tgl_ganti: {
      type: DataTypes.DATE,
      allowNull: true,
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

MasterMesin.hasMany(MasterSparepart, { foreignKey: "id_mesin" }),
  MasterSparepart.belongsTo(MasterMesin, {
    foreignKey: "id_mesin",
    as: "sparepart",
  });

module.exports = MasterSparepart;
