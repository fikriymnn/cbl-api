const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");
const InspeksiFinal = require("./inspeksiFinalModel");

const InspeksiFinalPoint = db.define(
  "cs_inspeksi_final_point",
  {
      id_inspeksi_final : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: InspeksiFinal
        }
      },
      point: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      standar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cara_periksa: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hasil: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      qty: {
          type: DataTypes.STRING,
          allowNull: true,
      },
  },
  {
    freezeTableName: true,
  }
);

InspeksiFinal.hasMany(InspeksiFinalPoint,{
    foreignKey: "id_inspeksi_final",as:"inspeksi_final_point"
})

InspeksiFinalPoint.belongsTo(InspeksiFinal,{
    foreignKey: 'id_inspeksi_final',as : "inspeksi_final"
})

module.exports = InspeksiFinalPoint;
