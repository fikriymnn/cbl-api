const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const StokSparepart = require("./stokSparepart");

const { DataTypes } = Sequelize;

const RequestStokSparepart = db.define(
  "spb_stok_sparepart",
  {
    id_stok_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StokSparepart,
        key: "id",
      },
    },
    tgl_spb: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_spb: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tgl_permintaan_kedatangan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    kriteria: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    incoming_sparepart: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tgl_po: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_po: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_satuan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_harga: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status_pengajuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_aktual: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

StokSparepart.hasMany(RequestStokSparepart, {
  foreignKey: "id_stok_sparepart",
}),
  RequestStokSparepart.belongsTo(StokSparepart, {
    foreignKey: "id_stok_sparepart",
  });

module.exports = RequestStokSparepart;
