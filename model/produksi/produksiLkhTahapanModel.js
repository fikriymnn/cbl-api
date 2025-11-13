const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const IoModel = require("../marketing/io/ioModel");
const SoModel = require("../marketing/so/soModel");
const MasterCustomer = require("../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const ProduksiLkhTahapan = db.define(
  "produksi_lkh_tahapan",
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
    id_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterTahapan,
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
    // id_mesin: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: MasterMesinTahapan,
    //     key: "id",
    //   },
    // },
    // id_create_produksi_lkh: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: Users,
    //     key: "id",
    //   },
    // },
    // id_operator: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: Users,
    //     key: "id",
    //   },
    // },
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
    index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "nonactive",
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

JoModel.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_jo",
  as: "produksi_lkh_tahapan",
});
ProduksiLkhTahapan.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_io",
  as: "produksi_lkh_tahapan",
});
ProduksiLkhTahapan.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(ProduksiLkhTahapan, {
  foreignKey: "id_so",
  as: "produksi_lkh_tahapan",
});
ProduksiLkhTahapan.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_customer",
  as: "produksi_lkh_tahapan",
});
ProduksiLkhTahapan.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_produk",
  as: "produksi_lkh_tahapan",
});
ProduksiLkhTahapan.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

MasterTahapan.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_tahapan",
});
ProduksiLkhTahapan.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});

Users.hasMany(ProduksiLkhTahapan, {
  foreignKey: "id_approve",
  as: "produksi_lkh_tahapan_approve",
});
ProduksiLkhTahapan.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
module.exports = ProduksiLkhTahapan;
