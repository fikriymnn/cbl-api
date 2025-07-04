const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel");
const TicketMtcOs3 = require("../maintenanceTicketOs3Model");

const { DataTypes } = Sequelize;

const ProsesMtc = db.define(
  "proses_mtc_os3",
  {
    id_tiket: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TicketMtcOs3,
        key: "id",
      },
    },
    id_eksekutor: {
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

    status_proses: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
      validate: {
        notEmpty: true,
      },
    },

    status_qc: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
      validate: {
        notEmpty: true,
      },
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

    tgl_mtc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimasi_pengerjaan: {
      type: DataTypes.INTEGER,
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
    nama_analisis_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_analisis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
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
    note_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_request_jadwal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alasan_pending: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    img_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_rework: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(ProsesMtc, { foreignKey: "id_eksekutor" });
Users.hasMany(ProsesMtc, { foreignKey: "id_qc" });
TicketMtcOs3.hasMany(ProsesMtc, { foreignKey: "id_tiket" });

ProsesMtc.belongsTo(Users, {
  foreignKey: "id_eksekutor",
  as: "user_eksekutor",
});
ProsesMtc.belongsTo(Users, { foreignKey: "id_qc", as: "user_qc" });
ProsesMtc.belongsTo(TicketMtcOs3, {
  foreignKey: "id_tiket",
  as: "tiket",
});

module.exports = ProsesMtc;
