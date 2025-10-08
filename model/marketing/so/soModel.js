const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Io = require("../io/ioModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const so = db.define(
  "so",
  {
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Io,
        key: "id",
      },
    },
    id_create_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_kalkulasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tgl_approve_so: {
      type: DataTypes.DATE,
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
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_pembuatan_so: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    tgl_input_po: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    id_so_cancel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    so_cancel: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_acc_customer: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_po_customer: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    po_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    harga_jual: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    no_po_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ppn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_pengiriman: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    alamat_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ada_standar_warna: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_pemesanan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acuan_warna: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    artwork: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    partial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kirim_semua: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    create_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ppic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_work: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_cancel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_bom_done: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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

Io.hasMany(so, {
  foreignKey: "id_io",
  as: "so",
});
so.belongsTo(Io, {
  foreignKey: "id_io",
  as: "io",
});

Users.hasMany(so, {
  foreignKey: "id_create_so",
  as: "so_create",
});
so.belongsTo(Users, {
  foreignKey: "id_create_so",
  as: "user_create",
});

Users.hasMany(so, {
  foreignKey: "id_approve_so",
  as: "so_approve",
});
so.belongsTo(Users, {
  foreignKey: "id_approve_so",
  as: "user_approve",
});

module.exports = so;
