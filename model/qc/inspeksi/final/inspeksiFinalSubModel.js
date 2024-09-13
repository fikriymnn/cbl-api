const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");
const InspeksiFinal = require("./inspeksiFinalModel");

const InspeksiFinalSub = db.define(
  "cs_inspeksi_final_sub",
  {
    id_inspeksi_final: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiFinal,
      },
    },
    quantity_awal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_akhir: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kualitas_lulus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kualitas_tolak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiFinal.hasMany(InspeksiFinalSub, {
  foreignKey: "id_inspeksi_final",
  as: "inspeksi_final_sub",
});

InspeksiFinalSub.belongsTo(InspeksiFinal, {
  foreignKey: "id_inspeksi_final",
  as: "inspeksi_final",
});

module.exports = InspeksiFinalSub;
