const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiAmparLem = require("./inspeksiAmparLemModel");
const User = require("../../../userModel");

const InspeksiAmparLemPoint = db.define(
  "cs_inspeksi_ampar_lem_point",
  {
    id_inspeksi_ampar_lem: {
      type: DataTypes.INTEGER,
      references: {
        model: InspeksiAmparLem,
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
    waktu_istirahat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_masuk_istirahat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_istirahat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

InspeksiAmparLem.hasMany(InspeksiAmparLemPoint, {
  foreignKey: "id_inspeksi_ampar_lem",
  as: "inspeksi_ampar_lem_point",
});
InspeksiAmparLemPoint.belongsTo(InspeksiAmparLem, {
  foreignKey: "id_inspeksi_ampar_lem",
  as: "inspeksi_point",
});

User.hasMany(InspeksiAmparLemPoint, {
  foreignKey: "id_inspektor",
});
InspeksiAmparLemPoint.belongsTo(User, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiAmparLemPoint;
