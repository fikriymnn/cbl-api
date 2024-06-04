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

    kode: {
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

    posisi_part: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    tgl_pasang: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_rusak: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    umur_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    umur_grade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    grade_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actual_umur: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sisa_umur: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    jenis_part: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "ganti",
    },

    umur_service: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    keterangan: {
      type: DataTypes.INTEGER,
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
