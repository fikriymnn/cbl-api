const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMesin = require("../../masterData/tahapan/masterMesinTahapanModel");

const { DataTypes } = Sequelize;

const KapasitasMesin = db.define(
  "kapsitas_mesin",
  {
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesin,
        key: "id",
      },
    },
    tahun: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    feb: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    apr: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mei: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jun: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jul: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ags: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sep: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    okt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nov: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    des: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

MasterMesin.hasMany(KapasitasMesin, {
  foreignKey: "id_mesin",
  as: "kapasitas_mesin",
});
KapasitasMesin.belongsTo(MasterMesin, {
  foreignKey: "id_mesin",
  as: "mesin",
});
module.exports = KapasitasMesin;
