const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// chart of account: tipe header (akun induk / grup) dan detail (akun transaksi),
// akun detail/header bisa jadi sub account dari header lewat id_parent
const MasterCoa = db.define(
  "master_coa",
  {
    id_parent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tipe_akun: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode_akun: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nama_akun: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipe: {
      type: DataTypes.ENUM("header", "detail"),
      allowNull: false,
      defaultValue: "detail",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Main",
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "IDR",
    },
    no_rekening: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    opening_balance: {
      type: DataTypes.DECIMAL(20, 4),
      allowNull: true,
      defaultValue: 0,
    },
    opening_balance_date: {
      type: DataTypes.DATEONLY,
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
  },
);

MasterCoa.hasMany(MasterCoa, {
  foreignKey: "id_parent",
  as: "sub_account",
});
MasterCoa.belongsTo(MasterCoa, {
  foreignKey: "id_parent",
  as: "parent",
});

Users.hasMany(MasterCoa, {
  foreignKey: "id_create",
  as: "master_coa_create",
});
MasterCoa.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

module.exports = MasterCoa;
