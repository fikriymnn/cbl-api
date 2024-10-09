const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiPotong = require("./inspeksiPotongModel");

const InspeksiPotongResult = db.define(
  "cs_inspeksi_potong_result",
  {
    id_inspeksi_potong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiPotong,
        key: "id",
      },
    },
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    point_check: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    standar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_check: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_panjang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_lebar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hasil_sample_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    send: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiPotong.hasMany(InspeksiPotongResult, {
  foreignKey: "id_inspeksi_potong",
  as: "inspeksi_potong_result",
});
InspeksiPotongResult.belongsTo(InspeksiPotong, {
  foreignKey: "id_inspeksi_potong",
  as: "inspeksi_potong",
});

module.exports = InspeksiPotongResult;
