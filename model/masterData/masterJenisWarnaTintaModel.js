const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const MasterJenisWarnaTinta = db.define(
  "ms_jenis_warna_tinta",
  {
    jenis: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = MasterJenisWarnaTinta;
