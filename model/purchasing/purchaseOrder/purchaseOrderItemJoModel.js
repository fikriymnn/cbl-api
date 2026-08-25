const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrder = require("./purchaseOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const BomPpicModel = require("../../ppic/bomPpic/bomPpicModel");
const SoModel = require("../../marketing/so/soModel");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterBrand = require("../../masterData/barang/masterBrandModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const PurchaseOrderItemJo = db.define(
  "purchase_order_item_jo",
  {
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
        key: "id",
      },
    },
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    id_brand: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBrand,
        key: "id",
      },
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_bom: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_po: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_terkirim: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_lebih: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_sisa: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_idle: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    tipe_barang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rencana_cetak: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_po: {
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

PurchaseOrder.hasMany(PurchaseOrderItemJo, {
  foreignKey: "id_purchase_order",
  as: "items_jo",
});
PurchaseOrderItemJo.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

JobOrder.hasMany(PurchaseOrderItemJo, {
  foreignKey: "id_jo",
  as: "po_item_jo",
});
PurchaseOrderItemJo.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});

MasterBarang.hasMany(PurchaseOrderItemJo, {
  foreignKey: "id_item",
  as: "items_jo",
});
PurchaseOrderItemJo.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});
module.exports = PurchaseOrderItemJo;
