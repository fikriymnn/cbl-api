const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterBrand = require("../../masterData/barang/masterBrandModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomCoating = db.define(
  "bom_coating",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },
    id_coating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    id_brand: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBrand,
        key: "id",
      },
    },

    nama_coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rumus_coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_coating: {
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
    tipe: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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

BomModel.hasMany(BomCoating, {
  foreignKey: "id_bom",
  as: "bom_coating",
});
BomCoating.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

MasterBarang.hasMany(BomCoating, {
  foreignKey: "id_coating",
});
BomCoating.belongsTo(MasterBarang, {
  foreignKey: "id_coating",
  as: "coating",
});

MasterBrand.hasMany(BomCoating, {
  foreignKey: "id_brand",
});
BomCoating.belongsTo(MasterBrand, {
  foreignKey: "id_brand",
  as: "brand",
});

module.exports = BomCoating;
