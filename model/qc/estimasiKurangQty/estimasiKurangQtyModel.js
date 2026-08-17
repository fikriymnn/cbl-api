const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const JoModel = require("../../ppic/jobOrder/jobOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const SoModel = require("../../marketing/so/soModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const MasterTahapan = require("../../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../masterData/tahapan/masterMesinTahapanModel");
const produksiLkhTahapan = require("../../produksi/produksiLkhTahapanModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const EstimasiKurangQty = db.define(
  "estimasi_kurang_qty_qc",
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
    id_request: {
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
    qty_jo: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_kurang_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_approve: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_request: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "requested",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      { name: "idx_ekqty_id_jo", fields: ["id_jo"] },
      { name: "idx_ekqty_id_io", fields: ["id_io"] },
      { name: "idx_ekqty_id_so", fields: ["id_so"] },
      { name: "idx_ekqty_id_tahapan", fields: ["id_tahapan"] },
      { name: "idx_ekqty_id_customer", fields: ["id_customer"] },
      { name: "idx_ekqty_id_produk", fields: ["id_produk"] },
      { name: "idx_ekqty_status", fields: ["status"] },
      { name: "idx_ekqty_is_active", fields: ["is_active"] },
      // Composite: sering di-query WHERE id_jo + id_tahapan + is_active
      {
        name: "idx_ekqty_jo_tahapan_active",
        fields: ["id_jo", "id_tahapan", "is_active"],
      },
      // Composite: untuk cari tahapan berikutnya WHERE id_jo + index + is_active
      {
        name: "idx_ekqty_jo_active",
        fields: ["id_jo", "is_active"],
      },
      { name: "idx_ekqty_createdAt", fields: ["createdAt"] },
    ],
  },
);

produksiLkhTahapan.hasMany(EstimasiKurangQty, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(produksiLkhTahapan, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_tahapan",
});

JoModel.hasMany(EstimasiKurangQty, {
  foreignKey: "id_jo",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(EstimasiKurangQty, {
  foreignKey: "id_io",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasMany(EstimasiKurangQty, {
  foreignKey: "id_so",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(EstimasiKurangQty, {
  foreignKey: "id_customer",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(EstimasiKurangQty, {
  foreignKey: "id_produk",
  as: "estimasi_kurang_qty_qc",
});
EstimasiKurangQty.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

MasterTahapan.hasMany(EstimasiKurangQty, {
  foreignKey: "id_tahapan",
});
EstimasiKurangQty.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});
Users.hasMany(EstimasiKurangQty, {
  foreignKey: "id_request",
  as: "estimasi_kurang_qty_qc_request",
});
EstimasiKurangQty.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});
Users.hasMany(EstimasiKurangQty, {
  foreignKey: "id_approve",
  as: "estimasi_kurang_qty_qc_approve",
});
EstimasiKurangQty.belongsTo(Users, {
  foreignKey: "id_approve",
  as: "user_approve",
});
module.exports = EstimasiKurangQty;
