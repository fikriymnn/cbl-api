const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const InspeksiCoating = require("./inspeksiCoatingModel");

const InspeksiCoatingSub = db.define(
  "cs_inspeksi_coating_sub",
  {
    
    id_inspeksi_coating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoating
      }
    },
    jumlah_periode_check: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
    waktu_check: {
        type: DataTypes.STRING,
        allowNull: true,
      }
  },
  {
    freezeTableName: true,
  }
);

InspeksiCoating.hasMany(InspeksiCoatingSub, {
    foreignKey: "id_inspeksi_coating",
    as: "inspeksi_coating_sub",
  });
InspeksiCoatingSub.belongsTo(InspeksiCoating, {
    foreignKey: "id_inspeksi_coating",
    as: "inspeksi_coating",
  });

module.exports = InspeksiCoatingSub;