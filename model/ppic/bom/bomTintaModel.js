const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterJenisKertas = require("../../masterData/masterJenisKertasModel");
const MasterJenisTinta = require("../../masterData/masterJenisTintaModel");
const MasterJenisWarnaTinta = require("../../masterData/masterJenisWarnaTintaModel");

const { DataTypes } = Sequelize;

const BomTinta = db.define(
  "bom_tinta",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },
    warna_tinta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_jenis_tinta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterJenisTinta,
        key: "id",
      },
    },
    id_jenis_kertas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterJenisKertas,
        key: "id",
      },
    },
    id_jenis_warna_tinta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterJenisWarnaTinta,
        key: "id",
      },
    },
    jenis_mesin_cetak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area_cetak: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_tinta: {
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

BomModel.hasMany(BomTinta, {
  foreignKey: "id_bom",
  as: "bom_tinta",
});
BomTinta.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

MasterJenisKertas.hasMany(BomTinta, {
  foreignKey: "id_jenis_kertas",
});
BomTinta.belongsTo(MasterJenisKertas, {
  foreignKey: "id_jenis_kertas",
  as: "jenis_kertas",
});

MasterJenisTinta.hasMany(BomTinta, {
  foreignKey: "id_jenis_tinta",
});
BomTinta.belongsTo(MasterJenisTinta, {
  foreignKey: "id_jenis_tinta",
  as: "jenis_tinta",
});

MasterJenisWarnaTinta.hasMany(BomTinta, {
  foreignKey: "id_jenis_warna_tinta",
});
BomTinta.belongsTo(MasterJenisWarnaTinta, {
  foreignKey: "id_jenis_warna_tinta",
  as: "jenis_warna_tinta",
});

module.exports = BomTinta;
