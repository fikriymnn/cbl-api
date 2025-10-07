const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
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
  foreignKey: "id_coating_depan",
});
BomCoating.belongsTo(MasterBarang, {
  foreignKey: "id_coating_depan",
  as: "coating_depan",
});

MasterBarang.hasMany(BomCoating, {
  foreignKey: "id_coating_belakang",
});
BomCoating.belongsTo(MasterBarang, {
  foreignKey: "id_coating_belakang",
  as: "coating_belakang",
});

module.exports = BomCoating;
