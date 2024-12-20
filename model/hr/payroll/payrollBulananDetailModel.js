const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PayrollBulananModel = require("./payrollBulananModel");

const { DataTypes } = Sequelize;

const PayrollBulananDetail = db.define(
  "payroll_bulanan_detail",
  {
    id_payroll_bulanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PayrollBulananModel,
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
PayrollBulananModel.hasMany(PayrollBulananDetail, {
  foreignKey: "id_payroll_bulanan",
  as: "detail_payroll",
});
PayrollBulananDetail.belongsTo(PayrollBulananModel, {
  foreignKey: "id_payroll_bulanan",
  as: "payroll",
});

module.exports = PayrollBulananDetail;
