const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Kalkulasi = require("./kalkulasiModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const KalkulasiUserAction = db.define(
  "kalkulasi_user_action",
  {
    id_kalkulasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Kalkulasi,
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },

    tgl: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  },
);

Kalkulasi.hasMany(KalkulasiUserAction, {
  foreignKey: "id_kalkulasi",
  as: "kalkulasi_action_user",
});
KalkulasiUserAction.belongsTo(Kalkulasi, {
  foreignKey: "id_kalkulasi",
  as: "kalkulasi",
});

Users.hasMany(KalkulasiUserAction, {
  foreignKey: "id_user",
});
KalkulasiUserAction.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});

module.exports = KalkulasiUserAction;
