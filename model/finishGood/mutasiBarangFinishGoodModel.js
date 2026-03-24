const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const JoDoneModel = require("../produksi/produksiJoDoneModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const MutasiBarangFinishGood = db.define(
  "mutasi_barang_finish_good",
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
    no_po_customer: {
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
    jumlah_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    //type mutasi untuk keluar dan masuk
    type_mutasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    //type mutasi keluar untuk traking tipe kiriman ke do (single, group)
    type_mutasi_keluar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    //type main jo mutasi keluar untuk traking jo utama jika type_mutasi_keluar group
    main_jo_mutasi_keluar: {
      type: DataTypes.STRING,
      allowNull: true,
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

JoModel.hasMany(MutasiBarangFinishGood, {
  foreignKey: "id_jo",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(MutasiBarangFinishGood, {
  foreignKey: "id_io",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(MutasiBarangFinishGood, {
  foreignKey: "id_so",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(MutasiBarangFinishGood, {
  foreignKey: "id_customer",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(MutasiBarangFinishGood, {
  foreignKey: "id_produk",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(MutasiBarangFinishGood, {
  foreignKey: "id_user",
  as: "mutasi_barang_finish_good",
});
MutasiBarangFinishGood.belongsTo(Users, {
  foreignKey: "id_user",
  as: "user",
});
module.exports = MutasiBarangFinishGood;
