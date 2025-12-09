const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const Deposit = db.define(
  "deposit",
  {
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterCustomer,
        key: "id",
      },
    },
    id_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_deposit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cara_bayar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    billing_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_faktur: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nominal: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
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

MasterCustomer.hasMany(Deposit, {
  foreignKey: "id_customer",
  as: "deposit",
});
Deposit.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});

Users.hasMany(Deposit, {
  foreignKey: "id_create",
  as: "deposit_create",
});
Deposit.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(Deposit, {
  foreignKey: "id_approve",
  as: "deposit_approve",
});
Deposit.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
Users.hasMany(Deposit, {
  foreignKey: "id_reject",
  as: "deposit_reject",
});
Deposit.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = Deposit;
