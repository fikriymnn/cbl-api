const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCetakAwal = require("./inspeksiCetakAwalModel");
const User = require("../../../userModel");

const InspeksiCetakAwalPoint = db.define(
  "cs_inspeksi_cetak_awal_point",
  {
    id_inspeksi_cetak_awal: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiCetakAwal,
        key: "id",
      },
    },
    id_inspektor: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
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
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    line_clearance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    design: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    redaksi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_bahan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramatur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    layout_pisau: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acc_warna_awal_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCetakAwal.hasMany(InspeksiCetakAwalPoint, {
  foreignKey: "id_inspeksi_cetak_awal",
  as: "inspeksi_cetak_awal_point",
});
InspeksiCetakAwalPoint.belongsTo(InspeksiCetakAwal, {
  foreignKey: "id_inspeksi_cetak_awal",
  as: "inspeksi_cetak_awal",
});

User.hasMany(InspeksiCetakAwalPoint, {
  foreignKey: "id_inspektor",
});
InspeksiCetakAwalPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiCetakAwalPoint;
