const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiLipat = require("./inspeksiLipatModel");
const User = require("../../../userModel");

const InspeksiLipatPoint = db.define(
  "cs_inspeksi_lipat_point",
  {
    id_inspeksi_lipat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiLipat,
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
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiLipat.hasMany(InspeksiLipatPoint, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat_point",
});
InspeksiLipatPoint.belongsTo(InspeksiLipat, {
  foreignKey: "id_inspeksi_lipat",
  as: "inspeksi_lipat",
});

User.hasMany(InspeksiLipatPoint, {
  foreignKey: "id_inspektor",
});
InspeksiLipatPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiLipatPoint;
