const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");

const { DataTypes } = Sequelize;

const MasterPerusahaan = db.define(
  "shift_harian",
  {
    hari: {
      type: DataTypes.ENUM(
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
        "Libur"
      ),
      allowNull: true,
      primaryKey: true,
    },
    shift_1_masuk: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    shift_1_keluar: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    shift_2_masuk: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    shift_2_keluar: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = MasterPerusahaan;
