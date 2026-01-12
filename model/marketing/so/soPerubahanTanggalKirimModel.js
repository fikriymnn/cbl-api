const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const So = require("./soModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const soPerubahanTglKirim = db.define(
  "so_perubahan_tgl_kirim",
  {
    id_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: So,
        key: "id",
      },
    },
    id_user_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_awal: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_perubahan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "requested",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

So.hasMany(soPerubahanTglKirim, {
  foreignKey: "id_so",
  as: "so_perubahan_tgl_kirim",
});
soPerubahanTglKirim.belongsTo(So, {
  foreignKey: "id_so",
  as: "so",
});

Users.hasMany(soPerubahanTglKirim, {
  foreignKey: "id_user_create",
});
soPerubahanTglKirim.belongsTo(Users, {
  foreignKey: "id_user_create",
  as: "user_create",
});

Users.hasMany(soPerubahanTglKirim, {
  foreignKey: "id_user_reject",
});
soPerubahanTglKirim.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});

Users.hasMany(soPerubahanTglKirim, {
  foreignKey: "id_user_approve",
});
soPerubahanTglKirim.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});

module.exports = soPerubahanTglKirim;
