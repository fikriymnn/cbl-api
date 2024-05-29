const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel");
const Ticket = require("../maintenaceTicketModel");
const TicketOs3 = require("../maintenanceTicketOs3Model");

const { DataTypes } = Sequelize;

const UsersActionMtc = db.define(
  "user_action_mtc",
  {
    id_mtc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },
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
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

// Relasi UsersActionMtc dengan Ticket
UsersActionMtc.belongsTo(Ticket, {
  foreignKey: "id_tiket", // Gunakan foreign key unik untuk relasi ini
  as: "tiket", // Alias opsional untuk asosiasi
});

UsersActionMtc.belongsTo(TicketOs3, {
  foreignKey: "id_tiket_os3", // Gunakan foreign key unik untuk relasi ini
  as: "tiket_os3", // Alias opsional untuk asosiasi
});

// Relasi UsersActionMtc dengan Users
UsersActionMtc.belongsTo(Users, {
  foreignKey: "id_mtc", // Gunakan foreign key unik untuk relasi ini
  as: "user_mtc", // Alias opsional untuk asosiasi
});

// Relasi Users dengan UsersActionMtc
Users.hasMany(UsersActionMtc, {
  foreignKey: "id_mtc", // Sesuaikan dengan foreign key dari tabel UsersActionMtc
  // Alias opsional untuk asosiasi
});

// Relasi Ticket dengan UsersActionMtc
Ticket.hasMany(UsersActionMtc, {
  foreignKey: "id_tiket", // Sesuaikan dengan foreign key dari tabel UsersActionMtc
  as: "user_tiket", // Alias opsional untuk asosiasi
});

TicketOs3.hasMany(UsersActionMtc, {
  foreignKey: "id_tiket_os3", // Sesuaikan dengan foreign key dari tabel UsersActionMtc
  as: "user_tiket_os3", // Alias opsional untuk asosiasi
});

// UsersActionMtc.hasMany(Ticket,{foreignKey : "id_tiket"})
// UsersActionMtc.belongsTo(Users,{foreignKey : "id_mtc",as:"user_mtc"})

// Users.hasMany(UsersActionMtc, {foreignKey : "id_mtc", })
// Ticket.hasMany(UsersActionMtc, {foreignKey : "id_tiket", as:"user_ticket"})

module.exports = UsersActionMtc;
