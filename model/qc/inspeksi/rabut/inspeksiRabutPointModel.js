const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiRabut = require("./inspeksiRabutModel");
const User = require("../../../userModel");

const InspeksiRabutPoint = db.define(
  "cs_inspeksi_rabut_point",
  {
    id_inspeksi_rabut: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiRabut,
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
    qty_pallet: {
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

InspeksiRabut.hasMany(InspeksiRabutPoint, {
  foreignKey: "id_inspeksi_rabut",
  as: "inspeksi_rabut_point",
});
InspeksiRabutPoint.belongsTo(InspeksiRabut, {
  foreignKey: "id_inspeksi_rabut",
  as: "inspeksi_point",
});

User.hasMany(InspeksiRabutPoint, {
  foreignKey: "id_inspektor",
});
InspeksiRabutPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiRabutPoint;
