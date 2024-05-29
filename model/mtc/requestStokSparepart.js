const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const StokSparepart = require("../mtc/stokSparepart");

const { DataTypes } = Sequelize;

const RequestStokSparepart = db.define(
  "request_stok_sparepart",
  {
    id_stok_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StokSparepart,
        key: "id",
      },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "request mtc",
    },
  },
  {
    freezeTableName: true,
  }
);

StokSparepart.hasMany(RequestStokSparepart, {
  foreignKey: "id_stok_sparepart",
}),
  RequestStokSparepart.belongsTo(StokSparepart, {
    foreignKey: "id_stok_sparepart",
  });

module.exports = RequestStokSparepart;
