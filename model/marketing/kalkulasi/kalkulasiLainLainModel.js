const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Kalkulasi = require("./kalkulasiModel");

const { DataTypes } = Sequelize;

const KalkulasiLainLain = db.define(
  "kalkulasi_qty",
  {
    id_kalkulasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Kalkulasi,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Kalkulasi.hasMany(KalkulasiLainLain, {
  foreignKey: "id_kalkulasi",
  as: "lain_lain",
});
KalkulasiLainLain.belongsTo(Kalkulasi, {
  foreignKey: "id_kalkulasi",
  as: "kalkulasi",
});

module.exports = KalkulasiLainLain;
