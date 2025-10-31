// models/masterWasteKendalaModel.js
const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;
const MasterKodeProduksi = require("./masterKodeProduksiModel");
const MasterTahapan = require("../tahapan/masterTahapanModel");

const MasterWasteKendala = db.define(
  "ms_waste_kendala",
  {
    id_tahapan_produksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterTahapan,
        key: "id",
      },
    },
    id_waste: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
    },
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
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

MasterTahapan.hasMany(MasterKodeProduksi, {
  foreignKey: "id_tahapan_produksi",
});
MasterKodeProduksi.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan_produksi",
});

MasterKodeProduksi.hasMany(MasterWasteKendala, {
  foreignKey: "id_kendala",
  as: "kendala",
});

MasterWasteKendala.belongsTo(MasterKodeProduksi, {
  foreignKey: "id_kendala",
  as: "kode_kendala",
});

MasterKodeProduksi.hasMany(MasterWasteKendala, {
  foreignKey: "id_waste",
  as: "waste",
});

MasterWasteKendala.belongsTo(MasterKodeProduksi, {
  foreignKey: "id_waste",
  as: "kode_waste",
});

module.exports = MasterWasteKendala;
