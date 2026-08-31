const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const BomPpicModel = require("../ppic/bomPpic/bomPpicModel");
const JobOrder = require("../ppic/jobOrder/jobOrderModel");
const SoModel = require("../marketing/so/soModel");
const IoModel = require("../marketing/io/ioModel");
const MasterBarang = require("../masterData/barang/masterBarangModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const OutstandingStockRawMaterial = db.define(
  "outstanding_stock_raw_material",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
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
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoModel,
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
    id_user_approve: {
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
    no_bom_ppic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
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
    rencana_cetak: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_masuk: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    tgl_approve: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    status_ticket: {
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
  },
);

JobOrder.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_jo",
  as: "outstanding_stock_raw_material",
});
OutstandingStockRawMaterial.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});

SoModel.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_so",
  as: "outstanding_stock_raw_material",
});
OutstandingStockRawMaterial.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});

IoModel.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_io",
  as: "outstanding_stock_raw_material",
});
OutstandingStockRawMaterial.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

BomPpicModel.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_bom_ppic",
  as: "outstanding_stock_raw_material",
});
OutstandingStockRawMaterial.belongsTo(BomPpicModel, {
  foreignKey: "id_bom_ppic",
  as: "bom_ppic",
});

MasterBarang.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_item",
  as: "outstanding_stock_raw_material",
});
OutstandingStockRawMaterial.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

Users.hasMany(OutstandingStockRawMaterial, {
  foreignKey: "id_user_approve",
  as: "outstanding_stock_raw_material_approve",
});
OutstandingStockRawMaterial.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
module.exports = OutstandingStockRawMaterial;
