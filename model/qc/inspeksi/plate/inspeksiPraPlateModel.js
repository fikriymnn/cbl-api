const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiPraPlate = db.define(
  "cs_inspeksi_pra_plate",
  {
    id_inspektor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.DATE,
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
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_warna: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    foto: {
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
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_check: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);
Users.hasMany(InspeksiPraPlate, {
  foreignKey: "id_inspektor",
});
InspeksiPraPlate.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiPraPlate;
