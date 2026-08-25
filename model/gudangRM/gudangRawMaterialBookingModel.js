const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const IoModel = require("../marketing/io/ioModel");
const BomPpicModel = require("../ppic/bomPpic/bomPpicModel");
const SoModel = require("../marketing/so/soModel");
const JobOrder = require("../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../masterData/barang/masterBarangModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const GudangRawMaterialBooking = db.define(
  "gudang_raw_material_booking",
  {
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

JobOrder.hasMany(GudangRawMaterialBooking, {
  foreignKey: "id_jo",
  as: "gudang_raw_material_booking",
});
GudangRawMaterialBooking.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});

MasterBarang.hasMany(GudangRawMaterialBooking, {
  foreignKey: "id_item",
  as: "gudang_raw_material_booking",
});
GudangRawMaterialBooking.belongsTo(MasterBarang, {
  foreignKey: "id_item",
  as: "master_barang",
});

Users.hasMany(GudangRawMaterialBooking, {
  foreignKey: "id_user_approve",
  as: "gudang_raw_material_booking_approve",
});
GudangRawMaterialBooking.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
module.exports = GudangRawMaterialBooking;
