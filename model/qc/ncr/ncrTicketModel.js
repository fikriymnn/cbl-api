const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const NcrTicket = db.define(
  "ncr_tiket",
  {
    no_ncr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori_laporan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_pelapor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_pelapor_p1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_qa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_mr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_defect: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_pelapor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department_pelapor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan_qa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan_mr: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bagian_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "menunggu validasi qa",
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(NcrTicket, { foreignKey: "id_pelapor" });
NcrTicket.belongsTo(Users, {
  foreignKey: "id_pelapor",
  as: "pelapor",
});

Users.hasMany(NcrTicket, { foreignKey: "id_qa" });
NcrTicket.belongsTo(Users, {
  foreignKey: "id_qa",
  as: "qa",
});

Users.hasMany(NcrTicket, { foreignKey: "id_mr" });
NcrTicket.belongsTo(Users, {
  foreignKey: "id_mr",
  as: "mr",
});

module.exports = NcrTicket;
