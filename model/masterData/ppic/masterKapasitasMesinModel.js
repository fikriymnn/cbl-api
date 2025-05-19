const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMesin = require("../masterMesinModel");

const { DataTypes } = Sequelize;

const MasterKapasitasMesin = db.define(
  "ms_kapasitas_mesin",
  {
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterKapasitasMesin;
