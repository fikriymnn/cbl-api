const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Ticket = require("../maintenaceTicketModel");
const TicketOs3 = require("../maintenanceTicketOs3Model");
const MasterSparepart = require("../masterData/masterSparepart");
const StokSparepart = require("../mtc/stokSparepart");
const ProsesMtc = require("../mtc/prosesMtc");
const ProsesMtcOs3 = require("../mtc/prosesMtcOs3");

const { DataTypes } = Sequelize;

const SparepartProblem = db.define(
  "masalah_sparepart",
  {
    id_tiket: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Ticket,
        key: "id",
      },
    },

    id_tiket_os3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TicketOs3,
        key: "id",
      },
    },

    id_proses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProsesMtc,
        key: "id",
      },
    },
    id_proses_os3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProsesMtcOs3,
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
    lokasi_sparepart_sebelumnya: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade_sparepart_sebelumnya: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    nama_sparepart_baru: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lokasi_sparepart_baru: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade_sparepart_baru: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_ganti: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tipe_perbaikan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "on progress",
      allowNull: true,
    },
    use_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Ticket.hasMany(SparepartProblem, { foreignKey: "id_tiket" }),
  TicketOs3.hasMany(SparepartProblem, { foreignKey: "id_tiket_os3" }),
  ProsesMtc.hasMany(SparepartProblem, { foreignKey: "id_proses" }),
  ProsesMtcOs3.hasMany(SparepartProblem, { foreignKey: "id_proses_os3" }),
  MasterSparepart.hasMany(SparepartProblem, { foreignKey: "id_ms_sparepart" }),
  SparepartProblem.belongsTo(Ticket, {
    foreignKey: "id_tiket",
    as: "problem_sparepart",
  });
SparepartProblem.belongsTo(TicketOs3, {
  foreignKey: "id_tiket_os3",
  as: "problem_sparepart_os3",
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

SparepartProblem.belongsTo(ProsesMtcOs3, {
  foreignKey: "id_proses_os3",
  as: "proses_mtc_os3",
});

module.exports = SparepartProblem;
