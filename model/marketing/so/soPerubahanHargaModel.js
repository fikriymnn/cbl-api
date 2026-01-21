const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const So = require("./soModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const soPerubahanHarga = db.define(
  "so_perubahan_harga",
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
    tgl_approve: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_reject: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    harga_awal: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    harga_perubahan: {
      type: DataTypes.FLOAT,
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
  },
);

So.hasMany(soPerubahanHarga, {
  foreignKey: "id_so",
  as: "so_perubahan_harga",
});
soPerubahanHarga.belongsTo(So, {
  foreignKey: "id_so",
  as: "so",
});

Users.hasMany(soPerubahanHarga, {
  foreignKey: "id_user_create",
});
soPerubahanHarga.belongsTo(Users, {
  foreignKey: "id_user_create",
  as: "user_create",
});

Users.hasMany(soPerubahanHarga, {
  foreignKey: "id_user_reject",
});
soPerubahanHarga.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});

Users.hasMany(soPerubahanHarga, {
  foreignKey: "id_user_approve",
});
soPerubahanHarga.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});

module.exports = soPerubahanHarga;
