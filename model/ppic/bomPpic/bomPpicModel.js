const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoModel = require("../../marketing/io/ioModel");
const BomModel = require("../bom/bomModel");
const SoModel = require("../../marketing//so/soModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomPpic = db.define(
  "bom_ppic",
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
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },
    id_create_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_bom_ppic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_approve_bom_ppic: {
      type: DataTypes.DATE,
      allowNull: true,
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
    no_bom: {
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
    tgl_kirim_customer: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    tgl_pembuatan_bom_ppic: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },

    status_bom_ppic: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "baru",
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

IoModel.hasMany(BomPpic, {
  foreignKey: "id_io",
  as: "bom_ppic",
});
BomPpic.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(BomPpic, {
  foreignKey: "id_so",
  as: "bom_ppic",
});
BomPpic.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});

BomModel.hasMany(BomPpic, {
  foreignKey: "id_bom",
  as: "bom_ppic",
});
BomPpic.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

Users.hasMany(BomPpic, {
  foreignKey: "id_create_bom_ppic",
  as: "bom_ppic_create",
});
BomPpic.belongsTo(Users, {
  foreignKey: "id_create_bom_ppic",
  as: "user_create",
});

Users.hasMany(BomPpic, {
  foreignKey: "id_approve_bom_ppic",
  as: "bom_ppic_approve",
});
BomPpic.belongsTo(Users, {
  foreignKey: "id_approve_bom_ppic",
  as: "user_approve",
});

module.exports = BomPpic;
