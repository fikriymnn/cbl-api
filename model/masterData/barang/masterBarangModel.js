const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterBrand = require("./masterBrandModel");
const MasterUnit = require("./masterUnitModel");

const { DataTypes } = Sequelize;

const MasterBarang = db.define(
  "ms_barang",
  {
    id_brand: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBrand,
        key: "id",
      },
    },
    id_purchase_unit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterUnit,
        key: "id",
      },
    },
    id_inventory_unit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterUnit,
        key: "id",
      },
    },
    kode_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sub_kategori: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramatur: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    panjang: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lebar: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    persentase: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    batas_harga: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pajak: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_per_satuan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    inventory_convert: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    warehouse: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
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

MasterBrand.hasMany(MasterBarang, {
  foreignKey: "id_brand",
  as: "barang",
});
MasterBarang.belongsTo(MasterBrand, {
  foreignKey: "id_brand",
  as: "brand",
});

MasterUnit.hasMany(MasterBarang, {
  foreignKey: "id_purchase_unit",
  as: "unit_purchase",
});
MasterBarang.belongsTo(MasterUnit, {
  foreignKey: "id_purchase_unit",
  as: "purchase_unit",
});

MasterUnit.hasMany(MasterBarang, {
  foreignKey: "id_inventory_unit",
  as: "unit_inventory",
});
MasterBarang.belongsTo(MasterUnit, {
  foreignKey: "id_inventory_unit",
  as: "inventory_unit",
});

module.exports = MasterBarang;
