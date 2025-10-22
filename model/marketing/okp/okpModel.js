const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Kalkulasi = require("../kalkulasi/kalkulasiModel");
const Users = require("../../userModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const { DataTypes } = Sequelize;

const okp = db.define(
  "okp",
  {
    id_kalkulasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Kalkulasi,
        key: "id",
      },
    },
    id_create_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_okp: {
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
    id_okp_previous: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tgl_approve_okp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    no_okp: {
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
    tgl_pembuatan_okp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    status_okp: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "baru",
    },
    tgl_target_marketing: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jenis_pekerjaan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tahapan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    id_pisau: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_spek_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rencana_qty_po: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    rencana_tgl_kirim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status_po: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "tidak",
    },
    keterangan_cetak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "on progress",
    },
    status_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "request desain",
    },
    posisi_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "desain",
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_io_done: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_new_okp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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

Kalkulasi.hasMany(okp, {
  foreignKey: "id_kalkulasi",
  as: "okp",
});
okp.belongsTo(Kalkulasi, {
  foreignKey: "id_kalkulasi",
  as: "kalkulasi",
});

//~~start~~//
MasterCustomer.hasMany(okp, {
  foreignKey: "id_customer",
  as: "okp",
});
okp.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "data_customer",
});
//~~end~~//

//~~start~~//
MasterProduk.hasMany(okp, {
  foreignKey: "id_produk",
  as: "okp",
});
okp.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "data_produk",
});
//~~end~~//

Users.hasMany(okp, {
  foreignKey: "id_create_okp",
  as: "okp_create",
});
okp.belongsTo(Users, {
  foreignKey: "id_create_okp",
  as: "user_create",
});

Users.hasMany(okp, {
  foreignKey: "id_approve_okp",
  as: "okp_approve",
});
okp.belongsTo(Users, {
  foreignKey: "id_approve_okp",
  as: "user_approve",
});

module.exports = okp;
