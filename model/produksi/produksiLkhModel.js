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

const ProduksiLkh = db.define(
  "produksi_lkh",
  {
    id_produksi_lkh_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: produksiLkhTahapan,
        key: "id",
      },
    },
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
    id_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterTahapan,
        key: "id",
      },
    },
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    id_operator: {
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
    tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qty_jo: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_druk: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
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

produksiLkhTahapan.hasMany(ProduksiLkh, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(produksiLkhTahapan, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_tahapan",
});

JoModel.hasMany(ProduksiLkh, {
  foreignKey: "id_jo",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(ProduksiLkh, {
  foreignKey: "id_io",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(ProduksiLkh, {
  foreignKey: "id_so",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(ProduksiLkh, {
  foreignKey: "id_customer",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(ProduksiLkh, {
  foreignKey: "id_produk",
  as: "produksi_lkh",
});
ProduksiLkh.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

MasterTahapan.hasMany(ProduksiLkh, {
  foreignKey: "id_tahapan",
  as: "produksi_lkh_tahapan",
});
ProduksiLkh.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});

MasterMesinTahapan.hasMany(ProduksiLkh, {
  foreignKey: "id_mesin",
  as: "produksi_lkh_mesin",
});
ProduksiLkh.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin",
  as: "mesin",
});

Users.hasMany(ProduksiLkh, {
  foreignKey: "id_operator",
  as: "produksi_lkh_operator",
});
ProduksiLkh.belongsTo(Users, {
  foreignKey: "id_operator",
  as: "operator",
});
module.exports = ProduksiLkh;
