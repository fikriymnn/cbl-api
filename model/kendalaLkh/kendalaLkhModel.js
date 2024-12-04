const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const KendalaLkh = db.define(
  "kendala_lkh",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_ticket: {
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
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
    },
    bagian_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
    },
    note_qc: {
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
    maksimal_kedatangan_tiket: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maksimal_periode_kedatangan_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Month",
    },
    maksimal_waktu_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(KendalaLkh, { foreignKey: "id_qc" });

KendalaLkh.belongsTo(Users, { foreignKey: "id_qc", as: "user_qc" });

module.exports = KendalaLkh;
