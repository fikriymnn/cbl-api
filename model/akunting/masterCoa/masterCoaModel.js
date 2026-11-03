const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// chart of account 3 tingkat lewat id_parent:
// header (level 1, grup utama) -> sub (level 2, sub grup) -> detail (level 3, akun transaksi)
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
      type: DataTypes.ENUM("header", "sub", "detail"),
      allowNull: false,
      defaultValue: "detail",
    },
    // saldo normal akun: debit / kredit
    tipe_saldo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // laporan tempat akun tampil: neraca / laba rugi
    tipe_report: {
      type: DataTypes.STRING,
      allowNull: true,
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
