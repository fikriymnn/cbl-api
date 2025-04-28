const { Sequelize } = require("sequelize");
const db = require("../../../config/database");

const StokSparepart = require("../stokSparepart");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const AdjusmentStokSparepart = db.define(
  "adjusment_sparepart",
  {
    id_stok_sparepart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StokSparepart,
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    pengurangan_penambahan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stok_terakhir: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tgl_adjusment: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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

StokSparepart.hasMany(AdjusmentStokSparepart, {
  foreignKey: "id_stok_sparepart",
  as: "adjusment_sparepart",
}),
  AdjusmentStokSparepart.belongsTo(StokSparepart, {
    foreignKey: "id_stok_sparepart",
    as: "sparepart",
  });

Users.hasMany(AdjusmentStokSparepart, {
  foreignKey: "id_user",
  as: "adjusment_sparepart_user",
}),
  AdjusmentStokSparepart.belongsTo(Users, {
    foreignKey: "id_user",
    as: "user",
  });

module.exports = AdjusmentStokSparepart;
