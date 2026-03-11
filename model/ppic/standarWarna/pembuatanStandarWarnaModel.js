const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const produksiLkhTahapan = require("../../produksi/produksiLkhTahapanModel");
const JoModel = require("../jobOrder/jobOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const SoModel = require("../../marketing/so/soModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const StandarWarna = db.define(
  "pembuatan_standar_warna",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
        key: "id",
      },
    },

    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoModel,
        key: "id",
      },
    },
    id_so: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SoModel,
        key: "id",
      },
    },
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterCustomer,
        key: "id",
      },
    },
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterProduk,
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
    id_user_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_kirim: {
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
      defaultValue: "progress",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "progress",
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

JoModel.hasMany(StandarWarna, {
  foreignKey: "id_jo",
  as: "pembuatan_standar_warna",
});
StandarWarna.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(StandarWarna, {
  foreignKey: "id_io",
  as: "pembuatan_standar_warna",
});
StandarWarna.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(StandarWarna, {
  foreignKey: "id_so",
  as: "pembuatan_standar_warna",
});
StandarWarna.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(StandarWarna, {
  foreignKey: "id_customer",
  as: "pembuatan_standar_warna",
});
StandarWarna.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(StandarWarna, {
  foreignKey: "id_produk",
  as: "pembuatan_standar_warna",
});
StandarWarna.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(StandarWarna, {
  foreignKey: "id_user_approve",
  as: "pembuatan_standar_warna_approve",
});
StandarWarna.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});

Users.hasMany(StandarWarna, {
  foreignKey: "id_user_reject",
  as: "pembuatan_standar_warna_reject",
});
StandarWarna.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});
module.exports = StandarWarna;
