const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoModel = require("../../marketing/io/ioModel");
const IoMountingModel = require("../../marketing/io/ioMountingModel");
const SoModel = require("../../marketing//so/soModel");
const JobOrder = require("../jobOrder/jobOrderModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const Bom = db.define(
  "bom",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
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
    id_io_mounting: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoMountingModel,
        key: "id",
      },
    },
    id_create_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_approve_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_approve_bom: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    nama_mounting: {
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
    tgl_pembuatan_bom: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    },
    status_bom: {
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
    is_bom_ppic_done: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
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

JobOrder.hasMany(Bom, {
  foreignKey: "id_jo",
  as: "bom",
});
Bom.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});

IoModel.hasMany(Bom, {
  foreignKey: "id_io",
  as: "bom",
});
Bom.belongsTo(IoModel, {
  foreignKey: "id_io",
  as: "io",
});

SoModel.hasOne(Bom, {
  foreignKey: "id_so",
  as: "bom",
});
Bom.belongsTo(SoModel, {
  foreignKey: "id_so",
  as: "so",
});

IoMountingModel.hasMany(Bom, {
  foreignKey: "id_io_mounting",
  as: "bom",
});
Bom.belongsTo(IoMountingModel, {
  foreignKey: "id_io_mounting",
  as: "io_mounting",
});

Users.hasMany(Bom, {
  foreignKey: "id_create_bom",
  as: "bom_create",
});
Bom.belongsTo(Users, {
  foreignKey: "id_create_bom",
  as: "user_create",
});

Users.hasMany(Bom, {
  foreignKey: "id_approve_bom",
  as: "bom_approve",
});
Bom.belongsTo(Users, {
  foreignKey: "id_approve_bom",
  as: "user_approve",
});

module.exports = Bom;
