const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const produksiLkhTahapan = require("./produksiLkhTahapanModel");
const produksiLkh = require("./produksiLkhModel");
const MasterKodeProduksi = require("../masterData/kodeProduksi/masterKodeProduksiModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const ProduksiLkhProses = db.define(
  "produksi_lkh_proses",
  {
    id_produksi_lkh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: produksiLkh,
        key: "id",
      },
    },
    id_produksi_lkh_tahapan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: produksiLkhTahapan,
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
    id_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterMesinTahapan,
        key: "id",
      },
    },
    id_operator: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_kode_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baik: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    rusak_sebagian: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    rusak_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    pallet: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_waktu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
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
  }
);

produksiLkh.hasMany(ProduksiLkhProses, {
  foreignKey: "id_produksi_lkh",
  as: "produksi_lkh_proses",
});
ProduksiLkhProses.belongsTo(produksiLkh, {
  foreignKey: "id_produksi_lkh",
  as: "produksi_lkh",
});

produksiLkhTahapan.hasMany(ProduksiLkhProses, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_proses",
});
ProduksiLkhProses.belongsTo(produksiLkhTahapan, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_tahapan",
});

MasterTahapan.hasMany(ProduksiLkhProses, {
  foreignKey: "id_tahapan",
  as: "produksi_lkh_proses_tahapan",
});
ProduksiLkhProses.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});

MasterMesinTahapan.hasMany(ProduksiLkhProses, {
  foreignKey: "id_mesin",
  as: "produksi_lkh_proses_mesin",
});
ProduksiLkhProses.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin",
  as: "mesin",
});

Users.hasMany(ProduksiLkhProses, {
  foreignKey: "id_operator",
  as: "produksi_lkh_proses_operator",
});
ProduksiLkhProses.belongsTo(Users, {
  foreignKey: "id_operator",
  as: "operator",
});
module.exports = ProduksiLkhProses;
