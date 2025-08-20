const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterHargaPengiriman = require("./masterHargaPengirimanModel");
const MasterMarketing = require("./masterMarketingModel");
const MasterProduk = require("./masterProdukModel");

const { DataTypes } = Sequelize;

const MasterCustomer = db.define(
  "ms_customer",
  {
    id_marketing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMarketing,
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
    id_harga_pengiriman: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterHargaPengiriman,
        key: "id",
      },
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_kantor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat_gudang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toleransi_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    top_faktur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_marketing: {
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

MasterHargaPengiriman.hasMany(MasterCustomer, {
  foreignKey: "id_harga_pengiriman",
  as: "customer",
});
MasterCustomer.belongsTo(MasterHargaPengiriman, {
  foreignKey: "id_harga_pengiriman",
  as: "harga_pengiriman",
});

MasterProduk.hasMany(MasterCustomer, {
  foreignKey: "id_produk",
  as: "customer",
});
MasterCustomer.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "produk",
});

MasterMarketing.hasMany(MasterCustomer, {
  foreignKey: "id_produk",
  as: "customer",
});
MasterCustomer.belongsTo(MasterMarketing, {
  foreignKey: "id_produk",
  as: "marketing",
});

module.exports = MasterCustomer;
