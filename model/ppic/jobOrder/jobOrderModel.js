const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoModel = require("../../marketing/io/ioModel");
const SoModel = require("../../marketing//so/soModel");
const BomModel = require("../bom/bomModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const JobOrder = db.define(
  "jo",
  {
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
    id_create_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
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
    tgl_approve_jo: {
      type: DataTypes.DATE,
      allowNull: true,
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

    tgl_pembuatan_jo: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    status_kalkulasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stok_fg: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    qty_druk: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    po_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spesifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_pengerjaan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toleransi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    standar_warna: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "draft",
    },
    note_reject: {
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
  }
);

IoModel.hasMany(JobOrder, {
  foreignKey: "id_io",
  as: "job_order",
});
JobOrder.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(JobOrder, {
  foreignKey: "id_so",
  as: "job_order",
});
JobOrder.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(JobOrder, {
  foreignKey: "id_customer",
  as: "job_order",
});
JobOrder.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(JobOrder, {
  foreignKey: "id_produk",
  as: "job_order",
});
JobOrder.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(JobOrder, {
  foreignKey: "id_create_jo",
  as: "jo_create",
});
JobOrder.belongsTo(Users, {
  foreignKey: "id_create_jo",
  as: "user_create",
});

Users.hasMany(JobOrder, {
  foreignKey: "id_approve_jo",
  as: "jo_approve",
});
JobOrder.belongsTo(Users, {
  foreignKey: "id_approve_jo",
  as: "user_approve",
});

module.exports = JobOrder;
