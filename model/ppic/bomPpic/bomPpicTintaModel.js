const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomPpicModel = require("./bomPpicModel");
const MasterJenisKertas = require("../../masterData/masterJenisKertasModel");
const MasterJenisTinta = require("../../masterData/masterJenisTintaModel");
const MasterJenisWarnaTinta = require("../../masterData/masterJenisWarnaTintaModel");

const { DataTypes } = Sequelize;

const BomPpicTinta = db.define(
  "bom_ppic_tinta",
  {
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
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

BomPpicModel.hasMany(BomPpicTinta, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic_tinta",
});
BomPpicTinta.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterJenisKertas.hasMany(BomPpicTinta, {
  foreignKey: "id_jenis_kertas",
});
BomPpicTinta.belongsTo(MasterJenisKertas, {
  foreignKey: "id_jenis_kertas",
  as: "jenis_kertas",
});

MasterJenisTinta.hasMany(BomPpicTinta, {
  foreignKey: "id_jenis_tinta",
});
BomPpicTinta.belongsTo(MasterJenisTinta, {
  foreignKey: "id_jenis_tinta",
  as: "jenis_tinta",
});

MasterJenisWarnaTinta.hasMany(BomPpicTinta, {
  foreignKey: "id_jenis_warna_tinta",
});
BomPpicTinta.belongsTo(MasterJenisWarnaTinta, {
  foreignKey: "id_jenis_warna_tinta",
  as: "jenis_warna_tinta",
});

module.exports = BomPpicTinta;
