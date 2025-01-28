const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const MasterBagian = require("./masterBagian");

const { DataTypes } = Sequelize;

const MasterRole = db.define(
  "ms_role",
  {
    // id_bagian: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: MasterBagian,
    //     key: "id",
    //   },
    // },
    nama_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
  },
  {
    freezeTableName: true,
  }
);

// MasterBagian.hasMany(MasterRole, { foreignKey: "id_bagian" }),
//   MasterRole.belongsTo(MasterBagian, {
//     foreignKey: "id_bagian",
//     as: "bagian",
//   });

module.exports = MasterRole;
