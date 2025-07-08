const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../config/database");
const KalibrasiAlatUkur = require("./kalibrasiAlatUkurModel");
const User = require("../../userModel");

const KalibrasiAlatUkurTiket = db.define(
  "kalibrasi_alat_ukur_tiket",
  {
    id_kalibrasi_alat_ukur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KalibrasiAlatUkur,
        key: "id",
      },
    },
    id_validator: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    nama_inspektor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_kalibrasi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "pending",
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "qc",
    },
  },
  {
    freezeTableName: true,
  }
);
KalibrasiAlatUkur.hasMany(KalibrasiAlatUkurTiket, {
  foreignKey: "id_kalibrasi_alat_ukur",
  as: "data_tiket",
});

KalibrasiAlatUkurTiket.belongsTo(KalibrasiAlatUkur, {
  foreignKey: "id_kalibrasi_alat_ukur",
  as: "kalibrasi_alat_ukur",
});

User.hasMany(KalibrasiAlatUkurTiket, {
  foreignKey: "id_validator",
});
KalibrasiAlatUkurTiket.belongsTo(User, {
  foreignKey: "id_validator",
  as: "validator",
});

module.exports = KalibrasiAlatUkurTiket;
