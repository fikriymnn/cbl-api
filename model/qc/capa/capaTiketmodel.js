const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const capa = db.define(
  "capa_tiket",
  {
    no_capa: {
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
    id_inspektor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
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
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_lapor: {
      type: DataTypes.DATE,
      allowNull: true,
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
    nama_produk: {
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
    catatan_verifikasi_qa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan_verifikasi_mr: {
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
      defaultValue: "incoming",
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(capa, { foreignKey: "id_pelapor" });
capa.belongsTo(Users, {
  foreignKey: "id_pelapor",
  as: "pelapor",
});

Users.hasMany(capa, { foreignKey: "id_inspektor" });
capa.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "inspektor",
});

Users.hasMany(capa, { foreignKey: "id_qa" });
capa.belongsTo(Users, {
  foreignKey: "id_qa",
  as: "qa",
});

Users.hasMany(capa, { foreignKey: "id_mr" });
capa.belongsTo(Users, {
  foreignKey: "id_mr",
  as: "mr",
});

module.exports = capa;
