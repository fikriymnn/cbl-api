const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Kalkulasi = require("./kalkulasiModel");

const { DataTypes } = Sequelize;

const KalkulasiQty = db.define(
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
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    harga_satuan_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
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

Kalkulasi.hasMany(KalkulasiQty, {
  foreignKey: "id_kalkulasi",
  as: "qty_list",
});
KalkulasiQty.belongsTo(Kalkulasi, {
  foreignKey: "id_kalkulasi",
  as: "kalkulasi",
});

module.exports = KalkulasiQty;
