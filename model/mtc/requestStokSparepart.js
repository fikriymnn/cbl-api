const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const StokSparepart = require("../mtc/stokSparepart");

const { DataTypes } = Sequelize;

const RequestStokSparepart = db.define(
  "request_stok_sparepart",
  {
    id_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kode: {
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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "requested",
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    req_sparepart_baru: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

// StokSparepart.hasMany(RequestStokSparepart, { foreignKey: "id_sparepart" }),
//   RequestStokSparepart.belongsTo(StokSparepart, { foreignKey: "id_sparepart" });

module.exports = RequestStokSparepart;
