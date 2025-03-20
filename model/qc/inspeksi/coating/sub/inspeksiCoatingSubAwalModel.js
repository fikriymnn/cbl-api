const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../../config/database");
const InspeksiCoating = require("../inspeksiCoatingModel");

const InspeksiCoatingSubAwal = db.define(
  "cs_inspeksi_coating_sub_awal",
  {
    id_inspeksi_coating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoating,
        key: "id",
      },
    },
    jumlah_periode_check: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    waktu_check: {
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
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiCoating.hasMany(InspeksiCoatingSubAwal, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating_sub_awal",
});
InspeksiCoatingSubAwal.belongsTo(InspeksiCoating, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating",
});

module.exports = InspeksiCoatingSubAwal;
