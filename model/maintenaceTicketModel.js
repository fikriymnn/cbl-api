const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Users = require("./userModel");

const { DataTypes } = Sequelize;

const Ticket = db.define(
  "ticket",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    id_respon_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
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
    id_eksekutor_rework: {
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
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    qty_druk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    spek: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    proses: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tgl: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    jenis_kendala: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    nama_kendala: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bagian_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
      validate: {
        notEmpty: true,
      },
    },

    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        notEmpty: true,
      },
    },
    waktu_respon: {
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
    rework: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    waktu_mulai_mtc_rework: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai_mtc_rework: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai_rework: {
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

    note_analisis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(Ticket, { foreignKey: "id_respon_mtc" });
Users.hasMany(Ticket, { foreignKey: "id_eksekutor" });
Users.hasMany(Ticket, { foreignKey: "id_eksekutor_rework" });
Users.hasMany(Ticket, { foreignKey: "id_qc" });

Ticket.belongsTo(Users, { foreignKey: "id_respon_mtc", as: "user_respon_mtc" });
Ticket.belongsTo(Users, { foreignKey: "id_eksekutor", as: "user_eksekutor" });
Ticket.belongsTo(Users, {
  foreignKey: "id_eksekutor_rework",
  as: "user_eksekutor_rework",
});
Ticket.belongsTo(Users, { foreignKey: "id_qc", as: "user_qc" });

module.exports = Ticket;
