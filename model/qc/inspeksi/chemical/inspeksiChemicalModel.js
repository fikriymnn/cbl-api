const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");

const InspeksiChemical = db.define(
  "cs_inspeksi_chemical",
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
    no_lot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_surat_jalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_chemical: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
    verifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
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
    waktu_check: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(InspeksiChemical, {
  foreignKey: "id_inspektor",
});
InspeksiChemical.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

module.exports = InspeksiChemical;
