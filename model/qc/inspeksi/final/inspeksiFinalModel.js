const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiFinal = db.define(
  "cs_inspeksi_final",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inspector: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_pallet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_packing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_packing: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_packing: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    bagian_tiket: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(InspeksiFinal, {
  foreignKey: "inspector",
});
InspeksiFinal.belongsTo(Users, {
  foreignKey: "inspector",
  as: "data_inspector",
});

module.exports = InspeksiFinal;
