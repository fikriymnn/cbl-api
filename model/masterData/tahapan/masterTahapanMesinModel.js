const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterMesinTahapan = require("./masterMesinTahapanModel");
const MasterTahapan = require("./masterTahapanModel");

const { DataTypes } = Sequelize;

const MasterTahapanMesin = db.define(
  "ms_tahapan_mesin",
  {
    id_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterTahapan,
        key: "id",
      },
    },
    id_mesin_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    shift: {
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

MasterMesinTahapan.hasMany(MasterTahapanMesin, {
  foreignKey: "id_mesin_tahapan",
});
MasterTahapanMesin.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin_tahapan",
  as: "mesin",
});

MasterTahapan.hasMany(MasterTahapanMesin, {
  foreignKey: "id_tahapan",
});
MasterTahapanMesin.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});

module.exports = MasterTahapanMesin;
