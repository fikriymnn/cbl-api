const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const IncomingOutsourcing = db.define(
  "cs_incoming_outsourcing",
  {
    id_inspektor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },

    tanggal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_sortir: {
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

    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_druk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isi_mata: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_pcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    outsourcing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_hasil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_jo: {
      type: DataTypes.INTEGER,
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
Users.hasMany(IncomingOutsourcing, {
  foreignKey: "id_inspektor",
});
IncomingOutsourcing.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = IncomingOutsourcing;
