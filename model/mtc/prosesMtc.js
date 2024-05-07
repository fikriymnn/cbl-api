const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel");
const TicketMtc = require("../maintenaceTicketModel");

const { DataTypes } = Sequelize;

const ProsesMtc = db.define(
  "proses_mtc",
  {
    id_tiket: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TicketMtc,
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
    note_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(ProsesMtc, { foreignKey: "id_eksekutor" });
Users.hasMany(ProsesMtc, { foreignKey: "id_qc" });
TicketMtc.hasMany(ProsesMtc, { foreignKey: "id_tiket" });

ProsesMtc.belongsTo(Users, {
  foreignKey: "id_eksekutor",
  as: "user_eksekutor",
});
ProsesMtc.belongsTo(Users, { foreignKey: "id_qc", as: "user_qc" });
ProsesMtc.belongsTo(TicketMtc, {
  foreignKey: "id_tiket",
  as: "tiket",
});

module.exports = ProsesMtc;
