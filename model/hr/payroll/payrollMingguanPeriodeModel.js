const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const KaryawanModel = require("../karyawanModel");
const UserModel = require("../../userModel");

const { DataTypes } = Sequelize;

const Payroll = db.define(
  "payroll_mingguan_periode",
  {
    id_hr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: KaryawanModel,
        key: "userid",
      },
    },
    id_user_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    id_user_submit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    id_user_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    id_user_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    id_user_pay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    periode_dari: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periode_sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_bayar: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  },
);

//relasi karyawan hr
KaryawanModel.hasMany(Payroll, {
  foreignKey: "id_hr",
  as: "hr_payroll_periode",
});
Payroll.belongsTo(KaryawanModel, {
  foreignKey: "id_hr",
  as: "karyawan_hr",
});

//relasi user
UserModel.hasMany(Payroll, {
  foreignKey: "id_user_create",
  as: "hr_payroll_periode_mingguan_create",
});
Payroll.belongsTo(UserModel, {
  foreignKey: "id_user_create",
  as: "user_create",
});

UserModel.hasMany(Payroll, {
  foreignKey: "id_user_submit",
  as: "hr_payroll_periode_mingguan_submit",
});
Payroll.belongsTo(UserModel, {
  foreignKey: "id_user_submit",
  as: "user_submit",
});

UserModel.hasMany(Payroll, {
  foreignKey: "id_user_approve",
  as: "hr_payroll_periode_mingguan_approve",
});
Payroll.belongsTo(UserModel, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
UserModel.hasMany(Payroll, {
  foreignKey: "id_user_reject",
  as: "hr_payroll_periode_mingguan_reject",
});
Payroll.belongsTo(UserModel, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});

UserModel.hasMany(Payroll, {
  foreignKey: "id_user_pay",
  as: "hr_payroll_periode_mingguan_pay",
});
Payroll.belongsTo(UserModel, {
  foreignKey: "id_user_pay",
  as: "user_pay",
});

module.exports = Payroll;
