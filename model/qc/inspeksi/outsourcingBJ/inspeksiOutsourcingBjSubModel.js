const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const Users = require("../../../userModel");
const InspeksiOutsourcingBJ = require("./inspeksiOutsourcingBJModel");

const InspeksiOutsourcingBJSub = db.define(
  "cs_inspeksi_outsourcing_bj_sub",
  {
    id_inspeksi_outsourcing_bj: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiOutsourcingBJ,
      },
    },
    quantity_awal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_akhir: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kualitas_lulus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kualitas_tolak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

InspeksiOutsourcingBJ.hasMany(InspeksiOutsourcingBJSub, {
  foreignKey: "id_inspeksi_outsourcing_bj",
  as: "inspeksi_outsourcing_bj_sub",
});

InspeksiOutsourcingBJSub.belongsTo(InspeksiOutsourcingBJ, {
  foreignKey: "id_inspeksi_outsourcing_bj",
  as: "inspeksi_outsourcing_bj",
});

module.exports = InspeksiOutsourcingBJSub;
