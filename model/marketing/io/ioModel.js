const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Okp = require("../okp/okpModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const io = db.define(
  "io",
  {
    id_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Okp,
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
    id_create_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_approve_io: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    base_no_io: {
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
    tgl_pembuatan_io: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    status_io: {
      type: DataTypes.STRING,
      allowNull: true,
      //defaultValue: "baru",
    },
    qty_send_proof: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
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
    status_send_proof: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status_send_proof: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    revisi_ke: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_updated: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_send_proof: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
  },
  {
    freezeTableName: true,
  },
);

Okp.hasMany(io, {
  foreignKey: "id_okp",
  as: "io",
});
io.belongsTo(Okp, {
  foreignKey: "id_okp",
  as: "okp",
});

//~~start~~//
MasterCustomer.hasMany(io, {
  foreignKey: "id_customer",
  as: "io",
});
io.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "data_customer",
});
//~~end~~//

//~~start~~//
MasterProduk.hasMany(io, {
  foreignKey: "id_produk",
  as: "io",
});
io.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "data_produk",
});
//~~end~~//

Users.hasMany(io, {
  foreignKey: "id_create_io",
  as: "io_create",
});
io.belongsTo(Users, {
  foreignKey: "id_create_io",
  as: "user_create",
});

Users.hasMany(io, {
  foreignKey: "id_approve_io",
  as: "io_approve",
});
io.belongsTo(Users, {
  foreignKey: "id_approve_io",
  as: "user_approve",
});

module.exports = io;
