const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const PurchaseOrder = require("../purchaseOrder/purchaseOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const BomPpicModel = require("../../ppic/bomPpic/bomPpicModel");
const SoModel = require("../../marketing/so/soModel");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterBrand = require("../../masterData/barang/masterBrandModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const RequestPurchase = db.define(
  "request_purchase",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
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
    id_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomPpicModel,
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
    id_request: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_purchase_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    no_bom_ppic: {
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
    no_jo: {
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
    nama_item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
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
    tgl_request: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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

JobOrder.hasMany(RequestPurchase, {
  foreignKey: "id_jo",
  as: "request_purchase",
});
RequestPurchase.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});
IoModel.hasMany(RequestPurchase, {
  foreignKey: "id_io",
  as: "request_purchase",
});
RequestPurchase.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasMany(RequestPurchase, {
  foreignKey: "id_so",
  as: "request_purchase",
});
RequestPurchase.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});

MasterBarang.hasMany(RequestPurchase, {
  foreignKey: "id_item",
  as: "request_purchase",
});
RequestPurchase.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "detail_item",
});

MasterBrand.hasMany(RequestPurchase, {
  foreignKey: "id_brand",
  as: "request_purchase",
});
RequestPurchase.belongsTo(MasterBrand, {
  foreignKey: "id_brand",
  as: "brand",
});

BomPpicModel.hasMany(RequestPurchase, {
  foreignKey: "id_bom_ppic",
  as: "request_purchase",
});
RequestPurchase.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

PurchaseOrder.hasMany(RequestPurchase, {
  foreignKey: "id_purchase_order",
  as: "request_purchase",
});
RequestPurchase.belongsTo(PurchaseOrder, {
  foreignKey: "id_purchase_order",
  as: "purchase_order",
});

Users.hasMany(RequestPurchase, {
  foreignKey: "id_request",
  as: "request_purchase",
});
RequestPurchase.belongsTo(Users, {
  foreignKey: "id_request",
  as: "user_request",
});

module.exports = RequestPurchase;
