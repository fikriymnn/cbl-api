const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const { DataTypes } = Sequelize;
const masterMesin = require("../../../masterData/masterMesinModel");
const Users = require("../../../userModel");

const ticketPm2 = db.define("ticket_pm2", {
  id_mesin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: masterMesin,
      key: "id",
    },
  },
  nama_mesin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tgl: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tgl_inspeksi: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  id_inspector: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: "id",
    },
  },

  id_leader: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: "id",
    },
  },

  id_supervisor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: "id",
    },
  },

  id_ka_bag: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: "id",
    },
  },

  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "incoming",
  },
  catatan: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  waktu_mulai: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  waktu_selesai: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

masterMesin.hasMany(ticketPm2, { foreignKey: "id_mesin" });
Users.hasMany(ticketPm2, { foreignKey: "id_inspector" });
Users.hasMany(ticketPm2, { foreignKey: "id_leader" });
Users.hasMany(ticketPm2, { foreignKey: "id_supervisor" });
Users.hasMany(ticketPm2, { foreignKey: "id_ka_bag" });

ticketPm2.belongsTo(masterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});

ticketPm2.belongsTo(Users, {
  foreignKey: "id_inspector",
  as: "inspector",
});
ticketPm2.belongsTo(Users, {
  foreignKey: "id_leader",
  as: "leader",
});
ticketPm2.belongsTo(Users, {
  foreignKey: "id_supervisor",
  as: "supervisor",
});
ticketPm2.belongsTo(Users, {
  foreignKey: "id_ka_bag",
  as: "ka_bag",
});

module.exports = ticketPm2;
