const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const MasterKodeAnalisis = require("../../masterKodeAnalisisModel");
const MasterMainGrupKodeAnalisis = require("./masterMainGrupKodeAnalisisModel");

const { DataTypes } = Sequelize;

const MasterChildGrupSkorAnalisis = db.define(
  "ms_child_grup_kode_analisis",
  {
    id_main_grup: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterMainGrupKodeAnalisis,
        key: "id",
      },
    },
    id_kode_analisis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterKodeAnalisis,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

MasterMainGrupKodeAnalisis.hasMany(MasterChildGrupSkorAnalisis, {
  foreignKey: "id_main_grup",
  as: "child_grup",
});
MasterChildGrupSkorAnalisis.belongsTo(MasterMainGrupKodeAnalisis, {
  foreignKey: "id_main_grup",
  as: "main_grup",
});

MasterKodeAnalisis.hasMany(MasterChildGrupSkorAnalisis, {
  foreignKey: "id_kode_analisis",
  as: "child_grup_analisis",
});
MasterChildGrupSkorAnalisis.belongsTo(MasterKodeAnalisis, {
  foreignKey: "id_kode_analisis",
  as: "kode_analisis",
});

module.exports = MasterChildGrupSkorAnalisis;
