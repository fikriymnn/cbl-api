const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const JoModel = require("../ppic/jobOrder/jobOrderModel");
const produksiLkhTahapan = require("./produksiLkhTahapanModel");
const produksiLkh = require("./produksiLkhModel");
const MasterKodeProduksi = require("../masterData/kodeProduksi/masterKodeProduksiModel");
const MasterTahapan = require("../masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../masterData/tahapan/masterMesinTahapanModel");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const ProduksiWaste = db.define(
  "produksi_lkh_waste",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
        key: "id",
      },
    },
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
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
    },
    id_waste: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKodeProduksi,
        key: "id",
      },
    },
    kode_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_waste: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi_waste: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proses: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    note: {
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
  },
);

JoModel.hasMany(ProduksiWaste, {
  foreignKey: "id_jo",
  as: "produksi_lkh_waste",
});
ProduksiWaste.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

produksiLkh.hasMany(ProduksiWaste, {
  foreignKey: "id_produksi_lkh",
  as: "produksi_lkh_waste",
});
ProduksiWaste.belongsTo(produksiLkh, {
  foreignKey: "id_produksi_lkh",
  as: "produksi_lkh",
});

produksiLkhTahapan.hasMany(ProduksiWaste, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_waste",
});
ProduksiWaste.belongsTo(produksiLkhTahapan, {
  foreignKey: "id_produksi_lkh_tahapan",
  as: "produksi_lkh_tahapan",
});

MasterTahapan.hasMany(ProduksiWaste, {
  foreignKey: "id_tahapan",
  as: "produksi_lkh_waste_tahapan",
});
ProduksiWaste.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan",
  as: "tahapan",
});

MasterMesinTahapan.hasMany(ProduksiWaste, {
  foreignKey: "id_mesin",
  as: "produksi_lkh_waste_mesin",
});
ProduksiWaste.belongsTo(MasterMesinTahapan, {
  foreignKey: "id_mesin",
  as: "mesin",
});

Users.hasMany(ProduksiWaste, {
  foreignKey: "id_operator",
  as: "produksi_lkh_waste_operator",
});
ProduksiWaste.belongsTo(Users, {
  foreignKey: "id_operator",
  as: "operator",
});

MasterKodeProduksi.hasMany(ProduksiWaste, {
  foreignKey: "id_kendala",
  as: "produksi_kendala",
});
ProduksiWaste.belongsTo(MasterKodeProduksi, {
  foreignKey: "id_kendala",
  as: "kendala",
});

MasterKodeProduksi.hasMany(ProduksiWaste, {
  foreignKey: "id_waste",
  as: "produksi_lkh_waste`",
});
ProduksiWaste.belongsTo(MasterKodeProduksi, {
  foreignKey: "id_waste",
  as: "waste",
});
module.exports = ProduksiWaste;
