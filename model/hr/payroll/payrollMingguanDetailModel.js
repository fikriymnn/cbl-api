const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PayrollMingguanModel = require("./payrollMingguanModel");

const { DataTypes } = Sequelize;

const PayrollMingguanDetail = db.define(
  "payroll_mingguan_detail",
  {
    id_payroll_mingguan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PayrollMingguanModel,
        key: "id",
      },
    },

    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nilai: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi payrollMingguan
PayrollMingguanModel.hasMany(PayrollMingguanDetail, {
  foreignKey: "id_payroll_mingguan",
  as: "detail_payroll",
});
PayrollMingguanDetail.belongsTo(PayrollMingguanModel, {
  foreignKey: "id_payroll_mingguan",
  as: "payroll",
});

module.exports = PayrollMingguanDetail;
