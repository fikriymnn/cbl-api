const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Okp = require("../okp/okpModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const io = db.define(
  "io",
  {
    id_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Okp,
        key: "id",
      },
    },
    id_create_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_approve_io: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_pembuatan_io: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    status_io: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "baru",
    },
    is_revisi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    revisi_no_io: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "on progress",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "on progress",
    },
    status_send_proof: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "on progress",
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Okp.hasMany(io, {
  foreignKey: "id_okp",
  as: "io",
});
io.belongsTo(Okp, {
  foreignKey: "id_okp",
  as: "okp",
});

Users.hasMany(io, {
  foreignKey: "id_create_io",
  as: "io_create",
});
io.belongsTo(Users, {
  foreignKey: "id_create_io",
  as: "user_create",
});

Users.hasMany(io, {
  foreignKey: "id_approve_io",
  as: "io_approve",
});
io.belongsTo(Users, {
  foreignKey: "id_approve_io",
  as: "user_approve",
});

module.exports = io;
