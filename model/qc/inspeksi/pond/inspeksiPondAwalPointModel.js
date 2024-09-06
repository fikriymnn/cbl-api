const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPondAwal = require("./inspeksiPondAwalModel");
const User = require("../../../userModel");

const InspeksiPondAwalPoint = db.define(
  "cs_inspeksi_pond_awal_point",
  {
    id_inspeksi_pond_awal: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiPondAwal,
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
    register: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ketajaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ukuran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bentuk_jadi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    riil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reforasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiPondAwal.hasMany(InspeksiPondAwalPoint, {
  foreignKey: "id_inspeksi_pond_awal",
  as: "inspeksi_pond_awal_point",
});
InspeksiPondAwalPoint.belongsTo(InspeksiPondAwal, {
  foreignKey: "id_inspeksi_pond_awal",
  as: "inspeksi_pond_awal",
});

User.hasMany(InspeksiPondAwalPoint, {
  foreignKey: "id_inspektor",
});
InspeksiPondAwalPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiPondAwalPoint;
