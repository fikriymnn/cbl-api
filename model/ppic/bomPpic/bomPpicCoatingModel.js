const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpicCoating = db.define(
  "bom_ppic_coating",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
        key: "id",
      },
    },
    id_coating_depan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    id_coating_belakang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },

    nama_coating_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_coating_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_coating_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_coating_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    uv_wb: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    varnish_doff: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_beli_coating_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    qty_stok_coating_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    qty_beli_coating_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    qty_stok_coating_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
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

BomPpicModel.hasMany(BomPpicCoating, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_coating",
});
BomPpicCoating.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(BomPpicCoating, {
  foreignKey: "id_coating_depan",
});
BomPpicCoating.belongsTo(MasterBarang, {
  foreignKey: "id_coating_depan",
  as: "coating_depan",
});

MasterBarang.hasMany(BomPpicCoating, {
  foreignKey: "id_coating_belakang",
});
BomPpicCoating.belongsTo(MasterBarang, {
  foreignKey: "id_coating_belakang",
  as: "coating_belakang",
});

module.exports = BomPpicCoating;
