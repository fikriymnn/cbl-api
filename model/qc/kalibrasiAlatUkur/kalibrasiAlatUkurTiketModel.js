const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../config/database");
const KalibrasiAlatUkur = require("./kalibrasiAlatUkurModel");

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
    tgl_kalibrasi: {
      type: DataTypes.DATE,
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
KalibrasiAlatUkur.hasMany(KalibrasiAlatUkurTiket, {
  foreignKey: "id_kalibrasi_alat_ukur",
  as: "data_tiket",
});

KalibrasiAlatUkurTiket.belongsTo(KalibrasiAlatUkur, {
  foreignKey: "id_kalibrasi_alat_ukur",
  as: "kalibrasi_alat_ukur",
});

module.exports = KalibrasiAlatUkurTiket;
