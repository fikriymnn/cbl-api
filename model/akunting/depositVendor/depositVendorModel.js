const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterVendor = require("../../masterData/marketing/masterVendorModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

// deposit ke vendor: input manual (draft -> requested -> approved) atau otomatis dari sisa lebih bayar invoice ap payment
const DepositVendor = db.define(
  "deposit_vendor",
  {
    id_vendor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterVendor,
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
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_proses: {
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
  },
);

MasterVendor.hasMany(DepositVendor, {
  foreignKey: "id_vendor",
  as: "deposit_vendor",
});
DepositVendor.belongsTo(MasterVendor, {
  foreignKey: "id_vendor",
  as: "vendor",
});

Users.hasMany(DepositVendor, {
  foreignKey: "id_create",
  as: "deposit_vendor_create",
});
DepositVendor.belongsTo(Users, {
  foreignKey: "id_create",
  as: "user_create",
});

Users.hasMany(DepositVendor, {
  foreignKey: "id_approve",
  as: "deposit_vendor_approve",
});
DepositVendor.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});

Users.hasMany(DepositVendor, {
  foreignKey: "id_reject",
  as: "deposit_vendor_reject",
});
DepositVendor.belongsTo(Users, {
  foreignKey: "id_reject",
  as: "user_reject",
});

module.exports = DepositVendor;
