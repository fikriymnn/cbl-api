const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const produksiLkhTahapan = require("./produksiLkhTahapanModel");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const ProduksiJoDone = db.define(
  "produksi_jo_done",
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
    id_user: {
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
    is_jo_done: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    status: {
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
  }
);

JoModel.hasMany(ProduksiJoDone, {
  foreignKey: "id_jo",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(ProduksiJoDone, {
  foreignKey: "id_io",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(ProduksiJoDone, {
  foreignKey: "id_so",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(ProduksiJoDone, {
  foreignKey: "id_customer",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(ProduksiJoDone, {
  foreignKey: "id_produk",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(ProduksiJoDone, {
  foreignKey: "id_user",
  as: "list_jo_selesai",
});
ProduksiJoDone.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = ProduksiJoDone;
