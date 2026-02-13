const { Sequelize } = require("sequelize");
const db = require("../config/database");
const maintenaceTicketModel = require("./maintenaceTicketModel");
const KaryawanModel = require("../model/hr/karyawanModel");
const RoleModel = require("../model/masterData/menu/masterRoleModel");

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    id_karyawan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: RoleModel,
        key: "id",
      },
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bagian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    divisi_bawahan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tahapan_bawahan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "aktif",
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  },
);

//relasi karyawan
KaryawanModel.hasMany(Users, {
  foreignKey: "id_karyawan",
  as: "data_karyawan",
});
Users.belongsTo(KaryawanModel, {
  foreignKey: "id_karyawan",
  as: "karyawan",
});

//relasi role
RoleModel.hasMany(Users, {
  foreignKey: "id_role",
  as: "data_user",
});
Users.belongsTo(RoleModel, {
  foreignKey: "id_role",
  as: "role_akses",
});

module.exports = Users;
