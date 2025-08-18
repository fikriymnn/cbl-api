const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLemAwal = require("./inspeksiLemAwalModel");
const User = require("../../../userModel");

const InspeksiLemAwalPoint = db.define(
  "cs_inspeksi_lem_awal_point",
  {
    id_inspeksi_lem_awal: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiLemAwal,
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
    posisi_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    daya_rekat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    posisi_lipatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kuncian_lock_bottom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bentuk_jadi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kebersihan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiLemAwal.hasMany(InspeksiLemAwalPoint, {
  foreignKey: "id_inspeksi_lem_awal",
  as: "inspeksi_lem_awal_point",
});
InspeksiLemAwalPoint.belongsTo(InspeksiLemAwal, {
  foreignKey: "id_inspeksi_lem_awal",
  as: "inspeksi_lem_awal",
});

User.hasMany(InspeksiLemAwalPoint, {
  foreignKey: "id_inspektor",
});
InspeksiLemAwalPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiLemAwalPoint;
