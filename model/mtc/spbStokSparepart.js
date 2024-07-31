const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const StokSparepart = require("./stokSparepart");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const RequestStokSparepart = db.define(
  "spb_stok_sparepart",
  {
    id_stok_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
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
    qty_update: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    kode_estimasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sumber: {
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
      defaultValue: "request to mtc",
    },
    tgl_aktual: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status_spb: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "progres",
    },

    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    note_verifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_validasi: {
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

Users.hasMany(RequestStokSparepart, {
  foreignKey: "id_user",
}),
  RequestStokSparepart.belongsTo(Users, {
    foreignKey: "id_user",
    as: "pelapor",
  });

Users.hasMany(RequestStokSparepart, {
  foreignKey: "id_qc",
}),
  RequestStokSparepart.belongsTo(Users, {
    foreignKey: "id_qc",
    as: "qc",
  });

module.exports = RequestStokSparepart;
