const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");
const InspeksiOutsourcingBJ = require("./inspeksiOutsourcingBJModel");

const InspeksiOutsourcingBJPoint = db.define(
  "cs_inspeksi_outsourcing_bj_point",
  {
    id_inspeksi_outsourcing_bj: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiOutsourcingBJ,
      },
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

InspeksiOutsourcingBJ.hasMany(InspeksiOutsourcingBJPoint, {
  foreignKey: "id_inspeksi_outsourcing_bj",
  as: "inspeksi_outsourcing_bj_point",
});

InspeksiOutsourcingBJPoint.belongsTo(InspeksiOutsourcingBJ, {
  foreignKey: "id_inspeksi_outsourcing_bj",
  as: "inspeksi_outsourcing_bj",
});

module.exports = InspeksiOutsourcingBJPoint;
