const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Users = require("./userModel");

const { DataTypes } = Sequelize;

const Ticket = db.define(
  "ticket",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_respon_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_respon_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },

    kode_ticket: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_druk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    spek: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proses: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jenis_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    nama_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bagian_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "qc",
    },

    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },
    bagian_mesin: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },

    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    status_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    waktu_respon_qc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_respon: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_mulai_mtc: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    waktu_selesai_mtc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    skor_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    cara_perbaikan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(Ticket, { foreignKey: "id_respon_mtc" });

Ticket.belongsTo(Users, { foreignKey: "id_respon_mtc", as: "user_respon_mtc" });

Users.hasMany(Ticket, { foreignKey: "id_respon_qc" });

Ticket.belongsTo(Users, { foreignKey: "id_respon_qc", as: "user_respon_qc" });

module.exports = Ticket;
