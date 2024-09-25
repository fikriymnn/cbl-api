const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiLipat = db.define(
  "cs_inspeksi_lipat",
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
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jam: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item: {
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
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(InspeksiLipat, {
  foreignKey: "id_inspektor",
});
InspeksiLipat.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiLipat;
