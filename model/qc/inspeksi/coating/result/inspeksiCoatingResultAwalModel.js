const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../../config/database");
const InspeksiCoating = require("../inspeksiCoatingModel");
const Users = require("../../../../userModel");

const InspeksiCoatingResultAwal = db.define(
  "cs_inspeksi_coating_result_awal",
  {
    id_inspeksi_coating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InspeksiCoating,
        key: "id",
      },
    },
    id_inspector: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lama_pengerjaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    line_clearance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permukaan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nilai_glossy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramatur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_coating: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spot_uv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tes_cracking: {
      type: DataTypes.STRING,
      allowNull: true,
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

InspeksiCoating.hasMany(InspeksiCoatingResultAwal, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating_result_awal",
});
InspeksiCoatingResultAwal.belongsTo(InspeksiCoating, {
  foreignKey: "id_inspeksi_coating",
  as: "inspeksi_coating",
});

Users.hasMany(InspeksiCoatingResultAwal, {
  foreignKey: "id_inspector",
});
InspeksiCoatingResultAwal.belongsTo(Users, {
  foreignKey: "id_inspector",
  as: "inspektor",
});

module.exports = InspeksiCoatingResultAwal;
