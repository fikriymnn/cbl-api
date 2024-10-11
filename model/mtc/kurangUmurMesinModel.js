const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const MasterMesin = require("../masterData/masterMesinModel");

const { DataTypes } = Sequelize;

const KurangUmur = db.define(
  "kurang_umur_mesin",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesin,
        key: "id",
      },
    },
    jumlah_dikurangi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterMesin.hasMany(KurangUmur, { foreignKey: "id_mesin" });

KurangUmur.belongsTo(MasterMesin, { foreignKey: "id_mesin", as: "mesin" });

module.exports = KurangUmur;
