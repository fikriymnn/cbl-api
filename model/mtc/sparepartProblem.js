const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Ticket = require("../maintenaceTicketModel");
const MasterSparepart = require("../masterData/masterSparepart");
const StokSparepart = require("../mtc/stokSparepart");
const ProsesMtc = require("../mtc/prosesMtc");

const { DataTypes } = Sequelize;

const SparepartProblem = db.define(
  "masalah_sparepart",
  {
    id_tiket: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ticket,
        key: "id",
      },
    },
    id_proses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProsesMtc,
        key: "id",
      },
    },
    id_ms_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterSparepart,
        key: "id",
      },
    },
    id_stok_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StokSparepart,
        key: "id",
      },
    },
    nama_sparepart_sebelumnya: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_part_sebelumnya: {
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
    jenis_part_baru: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_sparepart_baru: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "on progress",
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Ticket.hasMany(SparepartProblem, { foreignKey: "id_tiket" }),
  ProsesMtc.hasMany(SparepartProblem, { foreignKey: "id_tiket" }),
  MasterSparepart.hasMany(SparepartProblem, { foreignKey: "id_ms_sparepart" }),
  SparepartProblem.belongsTo(Ticket, {
    foreignKey: "id_tiket",
    as: "problem_sparepart",
  });

SparepartProblem.belongsTo(MasterSparepart, {
  foreignKey: "id_ms_sparepart",
  as: "master_sparepart",
});

StokSparepart.hasMany(SparepartProblem, { foreignKey: "id_stok_sparepart" }),
  SparepartProblem.belongsTo(StokSparepart, {
    foreignKey: "id_stok_sparepart",
    as: "stok_sparepart",
  });
SparepartProblem.belongsTo(ProsesMtc, {
  foreignKey: "id_proses",
  as: "proses_mtc",
});

module.exports = SparepartProblem;
