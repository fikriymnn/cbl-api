const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BapModel = require("./bapModel");
const GudangFinishGood = require("../gudangFinishGoodModel");
const JoModel = require("../../ppic/jobOrder/jobOrderModel");
const IoModel = require("../../marketing/io/ioModel");
const SoModel = require("../../marketing/so/soModel");
const MasterCustomer = require("../../masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../masterData/marketing/masterProdukModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BAPItem = db.define(
  "bap_item",
  {
    id_bap: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BapModel,
        key: "id",
      },
    },
    id_gudang_finish_good: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GudangFinishGood,
        key: "id",
      },
    },
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JoModel,
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
    id_user_create: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_approve_marketing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
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
    id_user_reject: {
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
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_po_customer: {
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
    po_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jumlah_qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tgl_masuk: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_create: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    tgl_respon: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
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
  }
);

BapModel.hasMany(BAPItem, {
  foreignKey: "id_bap",
  as: "bap_item",
});
BAPItem.belongsTo(BapModel, {
  foreignKey: "id_bap",
  as: "bap",
});

GudangFinishGood.hasMany(BAPItem, {
  foreignKey: "id_gudang_finish_good",
  as: "bap_item",
});
BAPItem.belongsTo(GudangFinishGood, {
  foreignKey: "id_gudang_finish_good",
  as: "gudang_finish_good",
});

JoModel.hasMany(BAPItem, {
  foreignKey: "id_jo",
  as: "bap_item",
});
BAPItem.belongsTo(JoModel, {
  foreignKey: "id_jo",
  as: "jo",
});

IoModel.hasMany(BAPItem, {
  foreignKey: "id_io",
  as: "bap_item",
});
BAPItem.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(BAPItem, {
  foreignKey: "id_so",
  as: "bap_item",
});
BAPItem.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});
MasterCustomer.hasMany(BAPItem, {
  foreignKey: "id_customer",
  as: "bap_item",
});
BAPItem.belongsTo(MasterCustomer, {
  foreignKey: "id_customer",
  as: "detail_customer",
});

MasterProduk.hasMany(BAPItem, {
  foreignKey: "id_produk",
  as: "bap_item",
});
BAPItem.belongsTo(MasterProduk, {
  foreignKey: "id_produk",
  as: "detail_produk",
});

Users.hasMany(BAPItem, {
  foreignKey: "id_user_create",
  as: "bap_item_create",
});
BAPItem.belongsTo(Users, {
  foreignKey: "id_user_create",
  as: "user_create",
});

Users.hasMany(BAPItem, {
  foreignKey: "id_user_approve_marketing",
  as: "bap_item_approve_marketing",
});
BAPItem.belongsTo(Users, {
  foreignKey: "id_user_approve_marketing",
  as: "user_approve_marketing",
});
Users.hasMany(BAPItem, {
  foreignKey: "id_user_approve",
  as: "bap_item_approve",
});
BAPItem.belongsTo(Users, {
  foreignKey: "id_user_approve",
  as: "user_approve",
});
Users.hasMany(BAPItem, {
  foreignKey: "id_user_reject",
  as: "bap_item_reject",
});
BAPItem.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});
module.exports = BAPItem;
