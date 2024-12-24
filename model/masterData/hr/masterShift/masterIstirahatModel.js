const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const MasterShiftModel = require("./masterShiftModel");

const { DataTypes } = Sequelize;

const MasterIstirahat = db.define(
  "istirahat_harian",
  {
    id_shift: {
      type: DataTypes.ENUM(
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu"
      ),
      allowNull: false,
      references: {
        model: MasterShiftModel,
        key: "hari",
      },
    },
    dari: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    sampai: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterShiftModel.hasMany(MasterIstirahat, {
  foreignKey: "id_shift",
  as: "istirahat",
});
MasterIstirahat.belongsTo(MasterShiftModel, {
  foreignKey: "id_shift",
});

module.exports = MasterIstirahat;
