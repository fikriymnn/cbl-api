const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterCustomer = require("./masterCustomerModel");

const { DataTypes } = Sequelize;

const MasterCustomerGudang = db.define(
  "ms_customer_gudang",
  {
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterCustomer,
        key: "id",
      },
    },
    alamat_gudang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telepon_gudang: {
      type: DataTypes.STRING,
      allowNull: false,
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

MasterCustomer.hasMany(MasterCustomerGudang, {
  foreignKey: "id_customer",
  as: "customer_gudang",
});
MasterCustomerGudang.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "customer",
});

module.exports = MasterCustomerGudang;
