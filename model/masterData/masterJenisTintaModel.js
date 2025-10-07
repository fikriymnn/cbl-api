const { Sequelize } = require("sequelize");
const db = require("../../config/database");

const { DataTypes } = Sequelize;

const MasterJenisTinta = db.define(
  "ms_jenis_tinta",
  {
    jenis: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    bobot: {
      type: DataTypes.DECIMAL(10, 1), // 10 total digit, 2 di belakang koma
      allowNull: false,
      defaultValue: 0.0,
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

module.exports = MasterJenisTinta;
